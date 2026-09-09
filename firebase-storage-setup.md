# Firebase Storage setup for Admin media uploads

The Admin dashboard uploads Listening audio and question images to Cloud Storage for Firebase.

Required Firebase project settings:

1. The project must have Cloud Storage enabled and be on the Blaze plan (required by current Firebase Cloud Storage).
2. Admin uploads must be performed by an authenticated Firebase user.
3. Deploy `storage.rules` so authenticated admins can write `audio/**` and `images/**`.
4. The web app domain must be listed in Firebase Authentication > Settings > Authorized domains so Google sign-in can authenticate the upload session.

The app intentionally reports authentication, permission, bucket, quota, and retry-limit failures with readable messages instead of leaving the progress indicator at 0% for several minutes.
