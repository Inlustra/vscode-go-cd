# vscode-go-cd README

## **Still in development**

Completely unofficial, This extension allows you to see your [Go CD](https://www.gocd.org/) pipelines from within VSCode

## Looking for help

Anyone wishing to contribute should get in touch! 
I currently only have my work Go CD environment to work from, so anyone with an environment where I can test authentication, pipeline failing, etc, would be really great!

## Features

- A small statusbar item can be added at the bottom of the view displaying the latest build status
  - Can automatically detect which pipeline to select based on your projects git url
- A new sidebar button to view all of the pipelines
  - View stages and jobs
  - View status of a pipeline
- Can stream the console logs from GoCD straight into your editor
- Be notified from within VSCode when pipelines fail

-----------------------------------------------------------------------------------------------------------

## Extension Settings

Include if your extension adds any VS Code settings through the `contributes.configuration` extension point.

For example:

This extension contributes the following settings:
* `gocd.url`: The url of your GoCD environment. **Usually ends in `/go/`**
  * For help configuring this, use the command: `Go CD: Set Global Config`
* `gocd.username`: If you have any authentication, this is your username. Otherwise, leave blank.
  * For help configuring this, use the command: `Go CD: Set Global Config`
  * Authentication is completely untested... I have no idea if this works 😬
* `gocd.password`: If you have any authentication, this is your password. Otherwise, leave blank.
  * For help configuring this, use the command: `Go CD: Set Global Config`
  * Authentication is completely untested... I have no idea if this works 😬
* `gocd.pipeline`: Should be set to the name of one of your pipelines.
  * Better configured using the command: `Go CD: Automatically Guess Selected Pipelines` if in a git repository.
  * Otherwise use the command: `Go CD: Manually Select Pipeline` to pick from a list.
* `gocd.refreshInterval`: Describes how often should the extension should poll the GoCD server in milliseconds
  * Defaults to 20 seconds

-----------------------------------------------------------------------------------------------------------

## Known Issues

* There is almost no error handling
* Currently completely untested. Tests will be written. 
* There are going to be a lot here

## TODO
- Implement proper error handling
- Write tests!
- Work on correcting the host url if it's slightly off
  - Automatically add a `/` if needed
  - Automatically add `/go/` if needed
- When a pipeline fails, add a button to automatically get the logs
- Add a real logger (console.log is silly)
  - Tidy up console logs
  - Add a debug mode?
- Change the log streamer to a webview? (Can't currently see terminal colors)
- Implement proper telemetry: vscode-extension-telemetry

## Release Notes

I'll be writing release notes when I think the extension is stable.
Expect lots of bugs in any version < 1 




