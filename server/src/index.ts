import express, { Express } from "express";
import bodyParser from 'body-parser';
import { completeRequest, getAllAccountData, initializeTransfer, access } from './routes';

// Configure and start the HTTP server.
const port: number = 8088;
const app: Express = express();
app.use(bodyParser.json());
app.post("/api/access", access);
app.post("/api/transactionStart", initializeTransfer);
app.post("/api/completeRequest", completeRequest);
app.get("/api/data", getAllAccountData);
app.listen(port, () => console.log(`Server listening on ${port}`));
