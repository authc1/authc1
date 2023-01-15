import { Hono, Context, Next } from 'hono'
import { authenticateApplication } from './middleware/authenticateApplication';
import { confirmRoutes } from './routes/confirm';
import { registerRoutes } from './routes/register';
import { verifyRoutes } from './routes/verify';

const app = new Hono()
const v1Routes = new Hono()

app.use(
    '*',
    async (ctx: Context, next: Next) => {
        const handler = authenticateApplication()
        return await handler(ctx, next);
    }
)


app.get('/', (ctx: Context) => ctx.text('Are you sure?'))
v1Routes.route('/register', registerRoutes);
v1Routes.route('/verify', verifyRoutes);
v1Routes.route('/confirm', confirmRoutes);
// v1Routes.route('/verify', registerRoutes);
// v1Routes.route('/verify', registerRoutes);
app.route('/api/v1', v1Routes);

export default app
