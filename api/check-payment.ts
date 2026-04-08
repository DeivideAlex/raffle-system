
export default async function handler(req: any, res: any) {
  const { id } = req.query;
  const token = process.env.MERCADO_PAGO_ACCESS_TOKEN;

  if (!id) return res.status(400).json({ error: 'ID is required' });

  try {
    const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!mpResponse.ok) {
      return res.status(mpResponse.status).json({ error: 'Error fetching payment' });
    }

    const payment = await mpResponse.json();
    return res.status(200).json({ 
      status: payment.status,
      status_detail: payment.status_detail 
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
