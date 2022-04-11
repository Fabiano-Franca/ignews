import { NextApiRequest, NextApiResponse } from "next"

export default function user(request: NextApiRequest, response: NextApiResponse) {
    const users = [
        { id: 1, name: 'Fabiano' },
        { id: 1, name: 'Alícia' },
        { id: 1, name: 'Mathues' },
    ]

    return response.json(users)
}
