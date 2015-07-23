## About

Medication adherence app

### Installation

In order to get started, cordova and ionic need to be installed.  Do this by running:

```
npm install -g cordova ionic gulp

npm install
```

Restore the platforms and plugins from package.json:

```
ionic state restore

```

And then...

```
bower install
```


### Emulating

In order to emulate for iOS you will need to have XCode Installed and be using a Mac.

Emulate iOS: `ionic emulate ios`

Emulate Android: `ionic emulate android`

If you'd like to demo the layout, run `ionic serve`

To test on a physical android device, plug in the device and run `ionic run android --device`.
Make sure USB debugging is enabled on your device.
