/* eslint-disable import/no-anonymous-default-export */

import { NextApiRequest, NextApiResponse } from 'next';
import { query as q } from 'faunadb';
import { getSession } from 'next-auth/react';
import { stripe } from './../../services/stripe';
import { fauna } from './../../services/fauna';

type User = {
    ref: {
        id: string;
    }
    data: {
        stripe_customer_id: string;
    }
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === 'POST') {
        const session = await getSession({ req })

        //Pega usuário da sessão(logado)
        const user = await fauna.query<User>(
            q.Get(
                q.Match(
                    q.Index('user_by_email'),
                    q.Casefold(session.user.email)
                )
            )
        )

        //Verifica se tem usuário no fauna, se nao tiver ele cria o usuario no stripe e atualiza no fauna
        let customerId = user.data.stripe_customer_id;

        if (!customerId) {
            //Criação do usuário no/do stripe
            const stripeCustomer = await stripe.customers.create({
                email: session.user.email,
                //meta
            })

            //Atualizar usuário do fauna com o id do usuário do stripe
            await fauna.query(
                q.Update(
                    q.Ref(q.Collection('users'), user.ref.id),
                    {
                        data: {
                            stripe_customer_id: stripeCustomer.id,
                        }
                    }
                )
            )

            customerId = stripeCustomer.id;
        }

        const stripeCheckoutSession = await stripe.checkout.sessions.create({
            customer: customerId,
            payment_method_types: ['card'],
            billing_address_collection: 'required',
            line_items: [
                { price: 'price_1KWpM6GyXVtQhuVSNoe7FNtg', quantity: 1 }
            ],
            mode: 'subscription',
            allow_promotion_codes: true,
            success_url: process.env.STRIPE_SUCCESS_URL,
            cancel_url: process.env.STRIPE_CANCEL_URL
        })

        return res.status(200).json({ sessionId: stripeCheckoutSession.id })
    } else {
        res.setHeader('Allow', 'POST')
        res.status(405).end('Method not allwed')
    }
}