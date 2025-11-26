![React](https://img.shields.io/badge/React-blue)
![Stable](https://img.shields.io/badge/Release-Stable-green)
![SnowflakeDB](https://img.shields.io/badge/Snowflake-DB_GUI-purple)
![Project Status: Improving](https://img.shields.io/badge/Status-Improving-orange)

<img width="800" style="border-radius:5px;" alt="thumbnail" src="https://amatris.ir/cdn/images/snowflake-db-gui-home.png?c=1">

# SnowflakeDB Control Panel
[SnowflakeDB](https://github.com/Ho3ein83/snowflake-db) is an advanced in-memory database which helps you easily make your own database or caching system.

This React app is a web interface for managing your database. SnowflakeDB comes with its own web interface, if you need to customize it, you can use this repository, otherwise you don't need this app.

## Configuration
To change the configuration of the web interface, open [index.html](https://github.com/Ho3ein83/snowflake-db-gui/blob/master/index.html) file located in the main directory.

This is how the configuration looks like, which you can change as you need:
```javascript
window.SF_CONFIG = {
    "prefix": "snowflake_",
    "default_language": "en",
    "default_theme_mode": "light",
    // Just for development and debug
    "render_logs": true,
    // Token expiration in seconds, set it to 0 for no expiration (not recommended)
    // Note: The expiration is only in your browser and after the token expired you can use it again the next time
    // you want to log in. Also, if the token gets expired while using the app it won't shut you down and you
    // can still do what you were doing, until you refresh the page and it'll ask you again for access token.
    "access_key_expiration": 86400, // 1 day
    // The lower the refresh interval is, the lower your server traffic will be, set it to 0 to disable auto-refreshing
    "refresh_interval": {
        "used_heap": 1000,
        "type_analyze": 0
    },
    // Socket configuration, you can change/find it from 'configs.yaml' file in your database app.
    "socket": {
        "host": "localhost",
        "port": 6401,
        "secure": false,
        "timeout": 15000
    }
};
```

### Socket
Before building the app (or even after), you need to set up your socket configuration in `index.html` file, by default it looks like this, but you may want to change them:
```json
"socket": {
    "host": "localhost",
    "port": 6401,
    "secure": false,
    "timeout": 15000
}
```

## Installation

###  1. Download
Clone the repository first:
```bash
git clone https://github.com/Ho3ein83/snowflake-db-gui
```
Switch to the directory:
```bash
cd snowflake-db-gui
```

###  2. Install the requirements
Run this command to install the requirements:
```bash
npm install
```

### 3. Configuration (optional)
Change socket configuration from `index.html` file.

If you are using it on localhost with default port, you don't need to change it.

### 4. Build or Run
Run vite for development:
```bash
vite
```
or build the project:
```bash
vite build --base=./
```

## Features
- See live database heap memory
- Analyze the type of values stored in your database
- Manage used and available memory
- Manage persistence
- Reload the database
- Add, edit or remove entries from database
- See the memory usage of each entry
- UI customization: Dark & light mode, multilingual
- Benchmark your database

<img width="800" style="border-radius:5px;" alt="thumbnail" src="https://amatris.com/cdn/images/hero-img-dark-and-light.png">

## Languages
Currently, there are two languages available:
- English (United States)
- Persian (Iran)

If you think you can help translating this app, it will be appreciated. Also, you can send me a request to add your language to the app.

## Contribution
We welcome and appreciate all contributions to this project! Whether it's fixing bugs, improving documentation, suggesting new features, or submitting pull requests, your input helps make the project better for everyone. If you have ideas, questions, or improvements, don't hesitate to open an issue or contribute directly.

## Copyright
This project is released with the intention of being freely usable by anyone for any purpose. You are welcome to copy, modify, redistribute, and use this project in any way you want — commercial or personal — without restriction.