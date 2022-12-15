import { Hono, Context, Next } from 'hono'
import { authenticateApplication } from './middleware/authenticateApplication';
import { registerRoutes } from './routes/register';

const app = new Hono()
const v1Routes = new Hono()

app.use(
    '*',
    async (ctx: Context, next: Next) => {
        const handler  = authenticateApplication()
        return await handler(ctx, next);
    }
)


app.get('/', (ctx: Context) => ctx.text('Are you sure?'))
v1Routes.route('/register', registerRoutes);
app.route('/api/v1', v1Routes);

export default app
