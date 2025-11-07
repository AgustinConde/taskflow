# Secret File Storage

Place your real environment-specific configuration files in this folder following the structure you reference from `config/environments/*.ps1`.

Suggested layout:

```
config/
└── secrets/
    ├── local/
    │   ├── TaskFlow.Api.appsettings.json
    │   ├── TaskFlow.Functions.local.settings.json
    │   └── frontend.env
    └── azure/
        ├── TaskFlow.Api.appsettings.json
        ├── TaskFlow.Functions.local.settings.json
        └── frontend.env
```

The files live outside of git (see `.gitignore`). Keep any `.example` templates here if you want to document required keys without exposing real secrets.
