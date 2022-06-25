import Head from 'next/head';
import styles from './styles.module.scss';
import Prismic from '@prismicio/client';
import { GetStaticProps } from 'next';
import { getPrismicClient } from './../../services/prismic';
import { RichText } from 'prismic-dom';

type Post = {
    slug: string;
    title: string;
    excerpt: string;
    updateAt: string;
}

interface PostsProps {
    posts: Post[]
}

export default function Posts({ posts }: PostsProps ){
    return(
        <>
            <Head>
                <title>Post | Ignews</title>
            </Head>
            <main className={styles.container}>
                <div className={styles.posts}>
                    { posts.map(post => (
                        <a key={post.slug} href="#">
                            <time>{post.updateAt}</time>
                            <strong>{ post.title }</strong>
                            <p>{ post.excerpt }</p>
                        </a>
                    )) }
                </div>
            </main>
        </>
    );
}

export const getStaticProps: GetStaticProps = async () => {
    const prismic = getPrismicClient()
    
    const response = await prismic.query([
        Prismic.predicates.at('document.type', 'id-publication')
    ], {
        fetch: ['id-publication.title', 'id-publication.content'],
        pageSize: 100,
    })

    console.log(JSON.stringify(response, null, 2))
    //console.log(JSON.stringify(response, null, 2))

    const posts = response.results.map(post => {
        return {
            slug: post.uid,
            title: RichText.asText(post.data.title),
            excerpt: RichText.asText(post.data.content),
            //excerpt: post.data.content.find(content => content.type === 'paragraph')?.text ?? '',
            updateAt: new Date(post.last_publication_date).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
            }),
        }
    })

    console.log(posts)

    return {
        props: {
            posts
        }
    }
}