import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { sign } from 'hono/jwt';
import { signupInput, signinInput } from "@vedeshp/blog-website-common";

export const userRouter = new Hono<{
	Bindings: {
		DATABASE_URL: string,
		JWT_SECRET: string,
	},
	Variables: {
		userId: string
	}
}>();


userRouter.post('/signup', async (c) => {
	const body = await c.req.json();
	const { success } = signupInput.safeParse(body)
	if (!success)	{
		c.status(400)
		return c.json({
			message: "Incorrect Inputs"
		})
	}
	const prisma = new PrismaClient({
		datasourceUrl: c.env.DATABASE_URL
	}).$extends(withAccelerate())
	try {
		const user = await prisma.users.create({
			data: {
				email: body.email,
				password: body.password,
				name: body.name
			}
		})
		const jwt = await sign({ id: user.id }, c.env.JWT_SECRET)
		return c.json({ jwt })
	} catch (e) {
		c.status(403)
		return c.json({ message: "error while signing up"})
	}
})


userRouter.post('/signin', async (c) => {
	const body = await c.req.json()
	const { success } = signupInput.safeParse(body)
	if (!success)	{
		c.status(400)
		return c.json({
			message: "Incorrect Inputs"
		})
	}
	const prisma = new PrismaClient({
		datasourceUrl: c.env.DATABASE_URL
	}).$extends(withAccelerate())
	try {
		const user = await prisma.users.findUnique({
			where: {
				email: body.email,
				password: body.password
			}
		})

		if (!user)  {
			c.status(403);
			return c.json({ error: 'user not found' })
		}

		const jwt = await sign({ id: user.id }, c.env.JWT_SECRET)
		return c.json({ jwt });
	}	catch (e)	{
		console.log(e);
		c.status(401)
		c.json({ message: "Unauthorized or Something went wrong"})
	}
})
