import { Hono } from 'hono'

const app = new Hono()

app.post('/api/v1/user/signup', (c) => {
  return c.text('Sign Up route!')
})

app.post('/api/v1/user/signin', (c) => {
  return c.text('Sign in Route')
})

app.post('/api/v1/blog', (c) => {
  return c.text('create a blog')
})

app.put('/api/v1/blog/', (c) => {
  return c.text('edit the blog')
})

app.get('/api/v1/blog/:id', (c) => {
  return c.text('get a particular blog')
})

app.get('/api/v1/blog/bulk', (c) => {
  return c.text('get all blogs')
})

export default app
