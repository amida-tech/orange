# Orange app Release Notes

# v1.0 - October 5, 2015

##DRE Medication Import
- Users may now import medications via Amida's Data Reconciliation Engine
– Users may begin this process during account creation

##Notes Filtering
– Users may now filter notes by attached medications.

##Medication Detail Enhancements
– Users will now see all notes attached to a medication when viewing the medication's details.

##Medication Lookup
– Medications not found in the RxNorm system may now be added manually.

##Doctor Lookup
– Doctors not found in the National Provider Identifier database may now be added manually.

##Notification Enhancements
– Individual event notifications can now be toggled via a quick-select button on the medication detail view.
– Notification text has been enhanced.
– Notifications now display the name of the log the notification is for.
- Notifications can now be set for the exact time in which a dosing event occurs.

##General
— Some warnings and prompts have been rewritten to fix grammar and improve clarity.
– Some destructive actions (such as cancelling a note, changing a password) have had prompts added to prevent accidental use.
– Some visual changes were applied to improve clarity.

##Bugfixes
– A bug where a user would not recieve all notifications if configured for multiple logs has been fixed.
– A bug where opening a notification took you to the wrong log was fixed.
– A bug where notifications would stop functioning on Android with device restart has been fixed.
– A bug where the Floating Action Button clipped list items if the list was too long was fixed.
– A bug where recieving notifications while in the midddle of adding a new medication caused you to lose your progress has been fixed.
– A bug where the time was not displaying properly for as needed medications has been fixed.
– A bug where certain details for pharmacies/doctors were not updating on save has been fixed.
– A bug where certain fields would be prepopulated with old data when used in succession has been fixed.


# v0.99.0 - September 15, 2015

## Account Creation
- Account registration is now available
- Accounts can be registered via the “create account” option
- A new account may generate various logs for tracking medications.
- A new account may request access to existing logs using the email address of the log owner.
- Logs may manually or automatically import medications from an exhisting EHR.
- Logs allow a user to set schedules and configure device notifications for medications.

## Medications
- Medications can now be imported into logs.
- Users may search for medications utilizing the RXnorm api.
- Users may flag medications as active, paused, or archived.
- Mediations can be assigned a schedule for tracking prescribed dosing.
- Users may configure notification reminders for medication dosing.

## Notes
- Notes can now be recorded.
- Users may add a note to a dosing event, or standalone.
- Users can tag a note with a specific medication to track side-effects.

## Doctors
- Doctors can now be recorded.
- Users may record a doctor with a National Provider Identifier via search.
- Users may record a doctors’s location and contact information.
- Users may add a note to a doctor entry.

## Pharmacies
- Pharmacies can now be recorded.
- Users may record a pharmacy’s location, hours and contact information.
- Users may add a note to a pharmacy entry.

## Logs
- Log management is now available.
- Users may edit information about logs here, including the photo, name, gender, phone number, sex, and daily habits.
- Users may create new logs.
- Users may request access to existing logs.
- Users may delete logs.

## Sharing
- Sharing logs is now available.
- Users may approve or deny existing log requests.
- If approving, a user may select which logs to share.
- Users may now generate monthly PDF adherence reports.
- Reports can be shared via email, or printed.
