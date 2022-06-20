import { fauna } from "../../../services/fauna";
import { query as q } from 'faunadb';
import { stripe } from './../../../services/stripe';

export async function saveSubscription(
    subscriptionId: string,
    customerId: string,
    createAction = false
) {
    //Buscar o usuário no banco do FaunaDB com o ID {customerId}
    //Salvar os dados da subscription no FaunaDB
    const userRef = await fauna.query(
        q.Select(
            "ref",
            q.Get(
                q.Match(
                    q.Index('user_by_stripe_customer_id'),
                    customerId
                )
            )
        )
    )
    console.log("UserRef: " + userRef)

    const subscription = await stripe.subscriptions.retrieve(subscriptionId)
    console.log("subscription:" + subscription)

    const subscriptionData = {
        id: subscription.id,
        userId: userRef,
        status: subscription.status,
        price_id: subscription.items.data[0].price.id,
    }

    console.log("subscriptionData: " + subscriptionData)


    if(createAction){
        await fauna.query(
            q.Create(
                q.Collection('subscriptions'),
                { data: subscriptionData }
            )
        )
    }else{
        

    }



}