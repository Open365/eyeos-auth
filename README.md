Eyeos-auth Library
==================

## Overview

The **eyeos-auth** library is intended to generate authorization cards signed by itself and validate them in different
backend services.

## How to use it

The cards follow the format:

```javascript
{
    "card": '{"username": "an-user", "domain":"the user domain", "expiration": epoc-timestamp, "permissions": ["",""]}',
    "signature": "signature-generated-by-server",
    "permissions": ["permission1", ...],
    "expiration": epoch_ts_when_card_expires_in_seconds,
    "renewCardDelay": seconds_from_card_creation_to_renew_card
}
```

A card contains a username, represented by a string (can be a username, a email, whatever its in ldap).,
A timestamp with the date limit when this card is no longer trusted.
An array of permission nodes. Each permission is a string with a given permission.

### Development mode

If you are using **eyeos-auth** in a development environment and want to bypass real validation, just set an 
environment variable:

```bash
export EYEOS_DEVELOPMENT_MODE=true && node my-amazing-service.js
```

### For component test only

You can get a card (with or without permissions) in order to execute requests that needs credentials. It is
useful if the services you test do not interact with the authentication service directly but you need 
valid card and signature.

	var eyeosAuth = new EyeosAuth();
	var credentitals = eyeosAuth.getFakeAuth('fakeUser', [ 'my.permission' ]);
	// now you can access to credentials.card and credentials.signature

## Quick help

* Install modules

```bash
	$ npm install
```

* Check tests

```bash
    $ grunt test
```