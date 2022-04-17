import { NextApiRequest, NextApiResponse } from "next"

export default function user(request: NextApiRequest, response: NextApiResponse) {

    console.log(request.query);

    const users = [
        { id: 1, name: 'Fabiano' },
        { id: 2, name: 'Alícia' },
        { id: 3, name: 'Matheus' },
    ]

    return response.json(users)
}
