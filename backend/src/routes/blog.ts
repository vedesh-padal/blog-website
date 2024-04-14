import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { verify } from 'hono/jwt';
import { createBlogInput, updateBlogInput } from "@vedeshp/blog-website-common";

export const blogRouter = new Hono<{
    Bindings: {
        DATABASE_URL: string,
        JWT_SECRET: string,
    },
    Variables: {
        userId: string
    }
}>();

blogRouter.use('/*', async (c, next) => {
    // to verify if the user is authorised
    const jwt = c.req.header('authorization')
    if (!jwt) {
      c.status(401)
      return c.json({ error: 'Unauthorized' })
    }
    try {
        const token = jwt.split(' ')[1]
        const payload = await verify(token, c.env.JWT_SECRET)
    
        if (!payload || !payload.id) {
        c.status(401)
        return c.json({ error: 'Unauthorized' })
        }
        c.set('userId', payload.id)
        await next();
    }   catch (e)   {
        console.log(e)
        return c.json({ error: "Unauthorized or something went wrong"})
    }
})
  


blogRouter.post('/', async (c) => {
    const body = await c.req.json();
    const { success } = createBlogInput.safeParse(body)
    if (!success)   {
        c.status(411)
        c.json({
            message: "Incorrect inputs"
        })
    }

    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL
    }).$extends(withAccelerate())

    try {
        const blog = await prisma.blog.create({
            data: {
                title: body.title,
                content: body.content,
                authorId: c.get('userId')
            }
        })

        return c.json({ id: blog.authorId, message: 'Your blog published successfully' })
    }   catch (e)   {
        console.log(e);
        c.json({ error: "error when publishing your blog" })
    }
})


blogRouter.put('/', async (c) => {
    const body = await c.req.json();

    const { success } = createBlogInput.safeParse(body)
    if (!success)   {
        c.status(411)
        c.json({
            message: "Incorrect inputs"
        })
    }
    
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL
    }).$extends(withAccelerate())

    try {
        const blog = await prisma.blog.update({
            where: {
                id: body.id,
                authorId: c.get('userId')
            },
            data: {
                title: body.title,
                content: body.content
            }
        })

        return c.json({ id: blog.authorId, message: 'Your Blog is updated successfully' })
    }   catch (e)   {
        console.log(e);
        c.json({ error: "error when publishing your blog" })
    }
})

// pagination to be added
blogRouter.get('/bulk', async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL
    }).$extends(withAccelerate())

    const blogs = await prisma.blog.findMany({
        select: {
            content: true,
            title: true,
            id: true,
            author: {
                select: {
                    name: true
                }
            }
        }
    });
    console.log('control reached in bulk')
    return c.json({
        blogs
    })
})


blogRouter.get('/:id', async (c) => {
    const id = c.req.param('id')
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL
    }).$extends(withAccelerate())

    try {
        const blog = await prisma.blog.findFirst({
            where: {
                id
            }
        })

        return c.json({ blog })
    }   catch (e)   {
        console.log(e);
        c.status(404)
        c.json({ error: "error while fetching blog post" })
    }
})


