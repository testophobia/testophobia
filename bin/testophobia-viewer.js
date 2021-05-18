#!/usr/bin/env node
'use strict';
import {Viewer} from '../lib/Viewer.js';
const v = new Viewer();
v.init().then(() => v.launchViewer());
