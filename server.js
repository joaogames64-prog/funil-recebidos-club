const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const HURAPAY_API_KEY = process.env.HURAPAY_API_KEY || 'cpk_live_wjx2ss5gdm8xkj0icknwsh5h';

// 🔑 TOKEN DO LOWTRACK - Configure aqui ou na variável de ambiente
const LOWTRACK_TOKEN = process.env.LOWTRACK_TOKEN || 'lt_cc5793ee738797e0d74bc17d753582eba4bdbca445771445';

// Product Catalog mapped to HuraPay product IDs and prices (cents)
const CATALOG = {
  plan_m3: { id: "prod_n15yi8eb3fedozgn90wxhlj4", price: 899 },
  plan_m6: { id: "prod_enhgtd3sslwkboqays88h1p2", price: 1299 },
  plan_m12: { id: "prod_k8w4doijk4kb0wwy90ph9rdq", price: 1699 },
  shipping_correios: { id: "prod_iom4tcrs3sw51ohf6xwavowg", price: 1771 },
  shipping_transportadora: { id: "prod_n46bjnhri9hw1loh5on6xhxq", price: 2248 },
  bump_kits: { id: "prod_rty59p60sqv1x5tw2tg4kz9q", price: 990 }
};

function getProductName(productId) {
  if(productId === CATALOG.plan_m3.id) return "Plano 3 Meses";
  if(productId === CATALOG.plan_m6.id) return "Plano 6 Meses";
  if(productId === CATALOG.plan_m12.id) return "Plano 12 Meses";
  if(productId === CATALOG.shipping_correios.id) return "Frete Correios";
  if(productId === CATALOG.shipping_transportadora.id) return "Frete Transportadora";
  if(productId === CATALOG.bump_kits.id) return "Kits Extras (Bump)";
  return "Produto Recebidos";
}

// Generates a valid CPF mathematically
function generateCPF() {
  const rnd = (n) => Math.round(Math.random() * n);
  const mod = (dividendo, divisor) => Math.round(dividendo - (Math.floor(dividendo / divisor) * divisor));
  const n = Array(9).fill('').map(() => rnd(9));
  let d1 = n.reduce((total, number, index) => (total + (number * (10 - index))), 0);
  d1 = 11 - mod(d1, 11);
  if (d1 >= 10) d1 = 0;
  let d2 = (d1 * 2) + n.reduce((total, number, index) => (total + (number * (11 - index))), 0);
  d2 = 11 - mod(d2, 11);
  if (d2 >= 10) d2 = 0;
  return `${n.join('')}${d1}${d2}`;
}

/**
 * Função Adapter para disparar webhooks padronizados para o LowTrack
 * @param {Object} saleEvent Evento interno mapeado contendo status, valor, transaction_id, etc.
 */
async function sendToLowtrack(saleEvent) {
  let mappedEvent = null;
  const status = saleEvent.status || saleEvent.event || "";

  // 1. Mapeamento Crítico de Status do LowTrack
  const approvedStatuses = ["paid", "approved", "completed", "purchase_approved", "succeeded", "confirmed", "charge.paid"];
  const pendingStatuses = ["waiting_payment", "pending", "awaiting_payment", "pix_created", "pix_generated", "boleto_created", "boleto_generated", "purchase_created", "purchase_billet_printed", "purchase_pix_generated", "processing", "open", "charge.pending", "charge.processing"];
  const refundedStatuses = ["refunded", "chargeback", "refund", "purchase_refunded", "purchase_chargeback", "reversed", "disputed", "dispute.chargeback"];
  const ignoredStatuses = ["refused", "declined", "failed", "expired", "charge.expired", "canceled", "canceled"];

  const statusLower = status.toLowerCase();

  if (approvedStatuses.includes(statusLower)) {
    mappedEvent = "sale.approved";
  } else if (pendingStatuses.includes(statusLower)) {
    mappedEvent = "sale.pending";
  } else if (refundedStatuses.includes(statusLower)) {
    mappedEvent = "sale.refunded";
  } else if (ignoredStatuses.includes(statusLower)) {
    // Ignorar requisições recusadas ou expiradas para não poluir
    return false;
  }

  // Se não reconhecer o status e não for ignorado, assumimos pending por segurança
  if (!mappedEvent) mappedEvent = "sale.pending";

  // 2. Normalização do payment_method
  let mappedMethod = "pix"; // Default fallback
  if (saleEvent.payment_method) {
    const pm = saleEvent.payment_method.toLowerCase();
    if (pm.includes("credit") || pm.includes("cartao") || pm.includes("card")) mappedMethod = "credit_card";
    else if (pm.includes("boleto") || pm.includes("billet") || pm.includes("bank_slip")) mappedMethod = "boleto";
    else if (pm.includes("debit")) mappedMethod = "debit_card";
    else if (pm.includes("paypal")) mappedMethod = "paypal";
    else mappedMethod = pm; // fallback cru caso seja outro mapeado validamente
  }

  // 3. Montagem do payload pro LowTrack
  const payload = {
    event: mappedEvent,
    transaction_id: saleEvent.transaction_id,
    amount: saleEvent.amount,
    currency: "BRL",
    payment_method: mappedMethod
  };

  // 4. Injetar produtos (identifica Order Bumps automaticamente)
  if (saleEvent.products && saleEvent.products.length > 0) {
    payload.product = saleEvent.products[0];
    payload.products = saleEvent.products;
  } else if (saleEvent.product) {
    payload.product = saleEvent.product;
  }

  // 5. Injetar dados de cliente
  if (saleEvent.customer) {
    payload.customer = saleEvent.customer;
  }

  // 6. Injetar UTMs
  if (saleEvent.tracking) {
    payload.tracking = saleEvent.tracking;
  }

  try {
    // Dispara via HTTP para o endpoint oficial do LowTrack via Axios
    const response = await axios.post('https://lowtrack.com.br/api/webhook', payload, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${LOWTRACK_TOKEN}`
      }
    });
    console.log(`[LowTrack] Evento ${mappedEvent} enviado com sucesso (${response.status}) para TID: ${saleEvent.transaction_id}`);
    return response.status >= 200 && response.status < 300;
  } catch (error) {
    console.error("[LowTrack] Falha ao enviar Webhook:", error.response?.data || error.message);
    return false;
  }
}

app.post('/api/checkout', async (req, res) => {
  try {
    const { customer, planKey, shippingKey, hasBump, utms } = req.body;

    if (!customer || !customer.email || !customer.phone) {
      return res.status(400).json({ error: "Dados de contato do cliente incompletos." });
    }

    if (!CATALOG[planKey] || !CATALOG[shippingKey]) {
      return res.status(400).json({ error: "Plano ou frete invalidos." });
    }

    let totalAmount = 0;
    const items = [];
    const lowtrackProducts = [];

    // Add Plan (Produto Principal pro LowTrack)
    items.push({ productId: CATALOG[planKey].id, quantity: 1 });
    totalAmount += CATALOG[planKey].price;
    lowtrackProducts.push({ id: CATALOG[planKey].id, name: getProductName(CATALOG[planKey].id) });

    // Add Shipping (Order Bump pro LowTrack)
    items.push({ productId: CATALOG[shippingKey].id, quantity: 1 });
    totalAmount += CATALOG[shippingKey].price;
    lowtrackProducts.push({ id: CATALOG[shippingKey].id, name: getProductName(CATALOG[shippingKey].id) });

    // Add Bump Kits (Order Bump pro LowTrack)
    if (hasBump) {
      items.push({ productId: CATALOG.bump_kits.id, quantity: 1 });
      totalAmount += CATALOG.bump_kits.price;
      lowtrackProducts.push({ id: CATALOG.bump_kits.id, name: getProductName(CATALOG.bump_kits.id) });
    }

    const validCpf = generateCPF();
    const cleanedPhone = customer.phone.replace(/\D/g, '');

    // Construção segura das UTMs (para evitar strings vazias desnecessárias)
    const trackingData = {
      utm_source: utms?.utm_source || "organic",
      utm_medium: utms?.utm_medium || "",
      utm_campaign: utms?.utm_campaign || "",
      utm_content: utms?.utm_content || "",
      utm_term: utms?.utm_term || "",
      src: utms?.src || "",
      sck: utms?.sck || ""
    };

    // --- STEP 1: Create PIX on HuraPay ---
    const payload = {
      amount: totalAmount,
      expiresIn: 3600,
      customer: {
        taxId: validCpf,
        name: customer.name || "Cliente Recebidos",
        email: customer.email,
        phone: cleanedPhone
      },
      items: items
    };

    const response = await axios.post('https://api.hurapay.com.br/v1/charge/pix', payload, {
      headers: {
        'X-API-KEY': HURAPAY_API_KEY,
        'Content-Type': 'application/json'
      }
    });

    const hurapayData = response.data;

    // --- STEP 2: Chamada do Adapter LowTrack para PIX Gerado (sale.pending) ---
    // O backend chama a função logo após gravar/criar a venda na gateway (HuraPay).
    // Aqui nós injetamos as UTMs da sessão. Elas vão ser gravadas na LowTrack vinculadas ao transaction_id.
    sendToLowtrack({
      status: hurapayData.status || "processing",
      transaction_id: hurapayData.id,
      amount: Number((totalAmount / 100).toFixed(2)), // Valor em BRL
      payment_method: "pix",
      customer: {
        name: customer.name || "Cliente Recebidos",
        email: customer.email,
        phone: cleanedPhone,
        document: validCpf
      },
      products: lowtrackProducts,
      tracking: trackingData
    });

    res.json(hurapayData);

  } catch (error) {
    console.error("HuraPay API Error:", error.response?.data || error.message);
    res.status(500).json({ 
      error: "Falha ao gerar cobrança", 
      details: error.response?.data || error.message 
    });
  }
});

// --- STEP 3: Rota para receber Webhooks da HuraPay ---
// Essa rota você configura na HuraPay: https://sua-url-do-vercel.com/api/webhook-hurapay
app.post('/api/webhook-hurapay', async (req, res) => {
  try {
    const webhookPayload = req.body;
    
    // A HuraPay envia "event" (ex: "charge.paid") e "data" (detalhes da charge)
    if (webhookPayload && webhookPayload.data && webhookPayload.data.id) {
      const chargeData = webhookPayload.data;
      
      // Quando ocorre o pagamento (charge.paid), enviamos ao LowTrack.
      // O LowTrack pegará o mesmo transaction_id e atualizará para sale.approved.
      // E o mais legal: As UTMs já estarão salvas lá no LowTrack pelo sale.pending enviado no checkout!
      await sendToLowtrack({
        status: webhookPayload.event, // Ex: charge.paid
        transaction_id: chargeData.id,
        amount: Number((chargeData.total / 100).toFixed(2)),
        payment_method: "pix" 
      });
    }

    res.status(200).send("OK");
  } catch (error) {
    console.error("Erro no Webhook HuraPay:", error.message);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = app;

if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`🚀 Recebidos Club Backend running on port ${PORT}`);
  });
}

