#!/bin/bash
./node_modules/.bin/istanbul cover --report cobertura --dir build/reports/ -- grunt test
