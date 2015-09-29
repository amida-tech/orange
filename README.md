#Orange Rx
Amida’s Orange Rx mobile application helps make medication adherence
easy and safe. Instead error-prone manual data entry, Orange Rx
automatically imports - under the patients control - personal health data from
a variety of electronic sources. Combining open source Blue ButtonTM technology with a simple, intuitive interface, Orange Rx enables patients and their care teams to track and log medications, control dosing and refills, and report adverse effects.

Some of the features of the Orange Rx app include:

– Notifications and reminders for medication dosing

– Automatic synchronization for up-to- date dosing information

– Multi-user log-in for multiple individuals to manage and view medication schedules

– Data storage in a secure, private, HIPAA-compliant server

– Easily hosted on a HIPAA-compliant Amida server, your server, or in the cloud

– Seamless integration to all file types and existing systems using Amida’s open source Data Reconciliation Engine


## About

Medication adherence app

### Installation

In order to get started, cordova and ionic need to be installed.  Do this by running:

```
npm install -g cordova ionic gulp bower

npm install
```

Restore the platforms and plugins from package.json:

```
ionic state restore
```

And then...

```
bower install
gulp sass
```


### Emulating

In order to emulate for iOS you will need to have XCode Installed and be using a Mac.

Emulate iOS: `ionic emulate ios`

Emulate Android: `ionic emulate android`

If you'd like to demo the layout, run `ionic serve`

To test on a physical android device, plug in the device and run `ionic run android --device`.
Make sure USB debugging is enabled on your device.


## Contributing

Contributors are welcome. See issues https://github.com/amida-tech/orange/issues

## Release Notes

See release notes [here] (./RELEASENOTES.md)

## License

Licensed under [Apache 2.0](./LICENSE)
