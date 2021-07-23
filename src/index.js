import 'dotenv/config';
import express from 'express';
import models, { sequelize } from './models';
import routes from './routes';
import bodyParser from 'body-parser';
import cors from 'cors';

const app = express();

var allowlist = ['http://www.test.com', 'http://test.com']

var corsOptions = {
  origin: '*',
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  preflightContinue: false,
  optionsSuccessStatus: 204 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

app.use(cors(corsOptions))

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/api', routes.authRoutes);
app.use('/api', routes.planRoutes);
app.use('/api', routes.socioRoutes);
app.use('/api', routes.coachRoutes);
app.use('/api', routes.usuarioRoutes);
app.use('/api', routes.claseRoutes);
app.use('/api', routes.periodoSocioRoutes);
app.use('/api', routes.configuracionClaseRoutes);

// Start
console.log(process.env.DATABASE_RESET);
const eraseDatabaseOnSync = false;// process.env.DATABASE_RESET;

sequelize.sync({ force: eraseDatabaseOnSync }).then(async () => {
  if (eraseDatabaseOnSync) {
    // createUserAdmin();
  }

  app.listen(process.env.PORT, () =>
    console.log(`Example app listening on port ${process.env.PORT}!`),
  );
});
