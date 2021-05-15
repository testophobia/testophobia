#!/usr/bin/env node
'use strict';
import {Testophobia} from '../lib/Testophobia.js';
const t = new Testophobia();
t.init().then(() => t.run());