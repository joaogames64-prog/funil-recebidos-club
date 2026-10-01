const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const HURAPAY_API_KEY = process.env.HURAPAY_API_KEY || 'cpk_live_wjx2ss5gdm8xkj0icknwsh5h';

// Product Catalog mapped to HuraPay product IDs and prices (cents)
const CATALOG = {
  plan_m3: { id: "prod_n15yi8eb3fedozgn90wxhlj4", price: 899 },
  plan_m6: { id: "prod_enhgtd3sslwkboqays88h1p2", price: 1299 },
  plan_m12: { id: "prod_k8w4doijk4kb0wwy90ph9rdq", price: 1699 },
  shipping_correios: { id: "prod_iom4tcrs3sw51ohf6xwavowg", price: 1771 },
  shipping_transportadora: { id: "prod_n46bjnhri9hw1loh5on6xhxq", price: 2248 },
  bump_kits: { id: "prod_rty59p60sqv1x5tw2tg4kz9q", price: 990 }
};

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

    // Add Plan
    items.push({ productId: CATALOG[planKey].id, quantity: 1 });
    totalAmount += CATALOG[planKey].price;

    // Add Shipping
    items.push({ productId: CATALOG[shippingKey].id, quantity: 1 });
    totalAmount += CATALOG[shippingKey].price;

    // Add Order Bump (if selected)
    if (hasBump) {
      items.push({ productId: CATALOG.bump_kits.id, quantity: 1 });
      totalAmount += CATALOG.bump_kits.price;
    }

    // Assign a valid CPF (generated unique per session)
    const validCpf = generateCPF();

    // Clean phone number (remove everything but digits)
    const cleanedPhone = customer.phone.replace(/\D/g, '');

    // Build externalId with UTM tracking info
    const utmSource = (utms && utms.utm_source) || 'organic';
    const utmMedium = (utms && utms.utm_medium) || '';
    const utmCampaign = (utms && utms.utm_campaign) || '';
    const utmSrc = (utms && utms.src) || '';
    const utmSck = (utms && utms.sck) || '';
    const utmParts = [`src_${utmSource}`];
    if (utmMedium) utmParts.push(`med_${utmMedium}`);
    if (utmCampaign) utmParts.push(`cmp_${utmCampaign}`);
    if (utmSrc) utmParts.push(`s_${utmSrc}`);
    if (utmSck) utmParts.push(`k_${utmSck}`);
    const externalId = `lead_${Date.now()}_${utmParts.join('_')}`;

    // --- STEP 1: Create PIX on HuraPay ---
    const payload = {
      amount: totalAmount,
      expiresIn: 3600,
      externalId: externalId,
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

    // --- STEP 2: Send tracking to LowTrack using HuraPay's charge ID ---
    // Uses sale.checkout (different from Rivoopay's sale.pending) so LowTrack
    // accepts it and attaches UTMs to the same sale.
    const LOWTRACK_TOKEN = 'lt_cc5793ee738797e0d74bc17d753582eba4bdbca445771445';
    try {
      const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
      const userAgent = req.headers['user-agent'] || '';
      
      const lowtrackProducts = [];
      lowtrackProducts.push({ id: CATALOG[planKey].id, name: `Plano ${planKey.split('_')[1]}` });
      if (hasBump) {
        lowtrackProducts.push({ id: CATALOG.bump_kits.id, name: "Kits Surpresa (Bump)" });
      }
      
      await axios.post('https://lowtrack.com.br/api/webhook', {
        event: "sale.checkout",
        transaction_id: hurapayData.id,
        amount: totalAmount / 100,
        currency: "BRL",
        payment_method: "pix",
        product: lowtrackProducts[0],
        products: lowtrackProducts,
        customer: {
          name: customer.name || "Cliente Recebidos",
          email: customer.email,
          phone: cleanedPhone,
          document: validCpf
        },
        tracking: {
          utm_source: utms?.utm_source || "",
          utm_medium: utms?.utm_medium || "",
          utm_campaign: utms?.utm_campaign || "",
          utm_term: utms?.utm_term || "",
          utm_content: utms?.utm_content || "",
          src: utms?.src || "",
          sck: utms?.sck || ""
        },
        user_ip: clientIp.split(',')[0].trim(),
        user_agent: userAgent,
        metadata: { platform: "hurapay" }
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${LOWTRACK_TOKEN}`
        }
      });
    } catch (ltErr) {
      console.error("LowTrack Error:", ltErr.response?.data || ltErr.message);
    }

    res.json(hurapayData);

  } catch (error) {
    console.error("HuraPay API Error:", error.response?.data || error.message);
    res.status(500).json({ 
      error: "Falha ao gerar cobrança", 
      details: error.response?.data || error.message 
    });
  }
});

// Export the Express app so Vercel can run it as a serverless function
module.exports = app;

// Only listen locally if we are not on Vercel
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`🚀 Recebidos Club Backend running on port ${PORT}`);
  });
}
