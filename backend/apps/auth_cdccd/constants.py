# Define plan limits here
PLAN_LIMITS = {
    "essentials": {
        "max_employees": 10,
        "max_ccd_users": 100,
    },
    "professional": {
        "max_employees": 500,
        "max_ccd_users": 500,
    },
    "enterprise": {
        "max_employees": None,  # unlimited
        "max_ccd_users": None,  # unlimited
    },
}

VALID_EMAIL_DOMAINS = [
    "client1.com",
    "client2.org",
    "partner.inc",
]