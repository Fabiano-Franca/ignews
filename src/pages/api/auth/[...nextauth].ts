import { query as q } from 'faunadb'
import NextAuth from "next-auth"
import GithubProvider from "next-auth/providers/github"
import { fauna } from './../../../services/fauna';

export default NextAuth({
    // Configure one or more authentication providers
    providers: [
        GithubProvider({
            clientId: process.env.GITHUB_ID,
            clientSecret: process.env.GITHUB_SECRET,
            authorization: {
                params: {
                    scope: 'read:user',
                }
            },
        }),
        // ...add more providers here
    ],
    callbacks: {
        async session({session}) {
            try {
                //Verificar se o usuário tem uma conta ativa ou não.
                const userActiveSubscription = await fauna.query(
                    q.Get(
                        // AND = WHERE subscription_by_user_ref = ref_pelo_email AND status = "active"
                        q.Intersection([
                            //Where subscription_by_user_ref = ref_pelo_email
                            q.Match(
                                q.Index('subscription_by_user_ref'),
                                //Pega a referencia do usuário pelo email
                                q.Select(
                                    "ref",
                                    q.Get(
                                        q.Match(
                                            q.Index('user_by_email'),
                                            q.Casefold(session.user.email)
                                        )
                                    )
                                )
                            ),
                            //Where status = "active"
                            q.Match(
                                q.Index('subscription_by_status'),
                                "active"
                            )
                        ])
                    )
                )
    
                return {
                    ...session,
                    activeSubscription: userActiveSubscription
                }    
            } catch (error) {
                return {
                    ...session,
                    activeSubscription: null
                }
            }
        },
        async signIn({ user }) {
            console.log("signIn");
            console.log(user);

            const { email } = user;

            try {
                await fauna.query(
                    q.If(
                        q.Not(
                            q.Exists(
                                q.Match(
                                    q.Index('user_by_email'),
                                    q.Casefold(user.email)
                                )
                            )
                        ),
                        q.Create(
                            q.Collection('users'),
                            { data: { email } }
                        ),
                        q.Get(
                            q.Match(
                                q.Index('user_by_email'),
                                q.Casefold(user.email)
                            )
                        )
                    )

                )
                return true
            } catch {
                return false
            }

        }
    }
})