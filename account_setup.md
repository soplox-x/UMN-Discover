# UMN Discover - Account Setup (PostgreSQL)
For Windows/macOS users using pgAdmin


## Step 1: Install PostgreSQL + pgAdmin
Visit https://www.postgresql.org/download/
Download the installer for your OS (Windows/macOS).
Make sure to install pgAdmin during setup.

## Step 2: Open pgAdmin
1. Launch pgAdmin.
2. Enter your PostgreSQL master password if prompted.

## Step 3: Create a New Role (User)
1. In the left sidebar, expand ```Servers``` → your PostgreSQL server.
2. Right-click on ```Login/Group Roles``` → Create → Login/Group Role.
3. Name: ```umn-app```
4. Go to 'Definition' tab → Password: ```umn1234```
5. Go to 'Privileges' tab → Set:
   - Can login: ```✅ Yes```
   - Create DB: ```✅ Yes```
6. Click 'Save'.

## Step 4: Create the Database
1. Right-click on 'Databases' → Create → Database.
2. Name: ```umn_discover```
3. Owner: ```umn-app```
4. Click **Save**.

## Step 5: Confirm It's Working
You should now see the `umn_discover` database under Databases.
Expand it → go to Schemas → Tables.
The backend will auto create tables.
You should also see in the console that if the db is connecting or failing

## Step 6: Backend Connection Config
```js
user:     umn-app
host:     localhost
database: umn_discover
password: umn1234
port:     5432
```
> You don't need to do this, its already the deafult config.


