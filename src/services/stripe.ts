import Stripe from 'stripe';

//1º Parâmetro: a secret key (chave) do stripe
//2º Parâmetro: as configurações obrigatórias
export const stripe = new Stripe(
    process.env.STRIPE_API_KEY!,
    {
        apiVersion: '2020-08-27',
        appInfo: {
            name: 'Ignews',
            version: '1.0',
        },

    }
);