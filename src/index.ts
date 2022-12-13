import { Hono, Context } from 'hono'
import { registerRoutes } from './routes/register';

const app = new Hono()
const v1Routes = new Hono()

app.get('/', (ctx: Context) => ctx.text('Are you sure?'))
v1Routes.route('/register', registerRoutes);
app.route('/api/v1', v1Routes);

export default app
