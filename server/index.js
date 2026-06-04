"use strict";

import express from 'express';
import path from 'node:path';
const app = express();

app.use('/', express.static('../'));
app.listen(3000);
