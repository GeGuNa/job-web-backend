const router = require('express').Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET);

router.post('/checkout', async (req, res) => {
  const { jobId } = req.body;
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{
      price_data: { currency: 'usd', product_data: { name: 'VIP Job Boost (7 days)' }, unit_amount: 2900 },
      quantity: 1
    }],
    mode: 'payment',
    success_url: `${req.headers.origin}/company-dashboard.html`,
    cancel_url: `${req.headers.origin}/pricing.html`,
    metadata: { jobId }
  });
  res.json({ url: session.url });
});


router.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  const sig = req.headers['stripe-signature'];
  const event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_ENDPOINT_SECRET);
  if (event.type === 'checkout.session.completed') {
    const jobId = event.data.object.metadata.jobId;
    pool.query("UPDATE jobs SET vip_until=NOW()+INTERVAL '7 days' WHERE id=$1", [jobId]);
  }
  res.json({ received: true });
});

module.exports = router;
