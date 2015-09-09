(function () {
    "use strict";

    angular
        .module('orange')
        .constant('errorList', {
            // Client secret (API-wide authentication)
            INVALID_CLIENT_SECRET: 'invalid_client_secret',

            // User
            EMAIL_REQUIRED: 'email_required',
            PASSWORD_REQUIRED: 'password_required',
            INVALID_EMAIL: 'invalid_email',
            USER_ALREADY_EXISTS: 'user_already_exists',

            // Authentication
            WRONG_PASSWORD: 'wrong_email_password',
            LOGIN_ATTEMPTS_EXCEEDED: 'login_attempts_exceeded',
            INVALID_ACCESS_TOKEN: 'invalid_access_token',
            ACCESS_TOKEN_REQUIRED: 'access_token_required',

            // Resetting password
            USER_NOT_FOUND: 'user_not_found',

            // Patients
            FIRST_NAME_REQUIRED: 'first_name_required',
            INVALID_SEX: 'invalid_sex',
            INVALID_BIRTHDATE: 'invalid_birthdate',
            UNAUTHORIZED: 'unauthorized',
            INVALID_ACCESS: 'invalid_access',
            INVALID_GROUP: 'invalid_group',
            INVALID_PATIENT_ID: 'invalid_patient_id',
            INVALID_SHARE_ID: 'invalid_share_id',
            IS_OWNER: 'is_owner',

            // List parameters
            INVALID_LIMIT: 'invalid_limit',
            INVALID_OFFSET: 'invalid_offset',
            INVALID_SORT_BY: 'invalid_sort_by',
            INVALID_SORT_ORDER: 'invalid_sort_order',
            INVALID_IS_USER: 'invalid_is_user',

            // Doctors
            INVALID_DOCTOR_ID: 'invalid_doctor_id',
            NAME_REQUIRED: 'name_required',

            // Pharmacies
            INVALID_PHARMACY_ID: 'invalid_pharmacy_id',
            INVALID_HOURS: 'invalid_hours',

            // Medications
            INVALID_MEDICATION_ID: 'invalid_medication_id',
            INVALID_QUANTITY: 'invalid_quantity',
            INVALID_DOSE: 'invalid_dose',
            INVALID_SCHEDULE: 'invalid_schedule',
            INVALID_FILL_DATE: 'invalid_fill_date',
            INVALID_IMPORT_ID: 'invalid_import_id',

            // Journal entries
            INVALID_JOURNAL_ID: 'invalid_journal_id',
            DATE_REQUIRED: 'date_required',
            TEXT_REQUIRED: 'text_required',
            INVALID_DATE: 'invalid_date',

            // Habits
            INVALID_WAKE: 'invalid_wake',
            INVALID_SLEEP: 'invalid_sleep',
            INVALID_BREAKFAST: 'invalid_breakfast',
            INVALID_LUNCH: 'invalid_lunch',
            INVALID_DINNER: 'invalid_dinner',
            INVALID_TZ: 'invalid_tz',
            INVALID_ACCESS_ANYONE: 'invalid_access_anyone',
            INVALID_ACCESS_FAMILY: 'invalid_access_family',
            INVALID_ACCESS_PRIME: 'invalid_access_prime',

            // Adherence events (doses)
            INVALID_DOSE_ID: 'invalid_dose_id',
            INVALID_TAKEN: 'invalid_taken',
            TAKEN_REQUIRED: 'taken_required',
            INVALID_SCHEDULED: 'invalid_scheduled',

            // Schedule
            INVALID_START_DATE: 'invalid_start',
            INVALID_END_DATE: 'invalid_end',

            // Should never get thrown by design
            UNKNOWN_ERROR: 'unknown_error',

            // Avatars
            INVALID_IMAGE: 'invalid_image',

            // Requests
            ALREADY_REQUESTED: 'already_requested',
            INVALID_REQUEST_ID: 'invalid_request_id',
            INVALID_STATUS: 'invalid_status',

            // Times (for notification settings)
            INVALID_TIME_ID: 'invalid_time_id',
            INVALID_DEFAULT: 'invalid_default',
            INVALID_USER: 'invalid_user',

            // External APIs
            BLOOM_ERROR: 'bloom_error',
            RXNORM_ERROR: 'rxnorm_error'
        });
})();
