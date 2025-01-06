/*global Harunow _config AmazonCognitoIdentity AWSCognito*/

var Harunow = window.Harunow || {};

(function scopeWrapper($) {
    var signinUrl = '/login/';

    var poolData = {
        UserPoolId: _config.cognito.userPoolId,
        ClientId: _config.cognito.userPoolClientId
    };

    var userPool;

    if (!(_config.cognito.userPoolId &&
        _config.cognito.userPoolClientId &&
        _config.cognito.region)) {
        $('#noCognitoMessage').show();
        return;
    }

    userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

    if (typeof AWSCognito !== 'undefined') {
        AWSCognito.config.region = _config.cognito.region;
    }

    Harunow.signOut = function signOut() {
        userPool.getCurrentUser().signOut();
    };
    Harunow.schoolKey = "testsch";
    let username;
    let userId;
    let group;

    Harunow.authToken = new Promise(function fetchCurrentAuthToken(resolve, reject) {
        var cognitoUser = userPool.getCurrentUser();

        if (cognitoUser) {
            cognitoUser.getSession(function sessionCallback(err, session) {
                if (err) {
                    reject(err);
                } else if (!session.isValid()) {
                    console.log("session not valid")
                    resolve(null);
                } else {
                    userId = session.getIdToken().payload.sub;
                    username = cognitoUser.getUsername();
                    console.log(session.getIdToken());
                    group = session.getIdToken().payload['cognito:groups'];
                    resolve(session.getIdToken().getJwtToken());
                }
            });
        } else {
            resolve(null);
        }
    });

    Harunow.Username = username;
    Harunow.UserId = userId;
    Harunow.Group = group;

    /*
     * Cognito User Pool functions
     */

    function register(username, email, password, onSuccess, onFailure) {
        var dataEmail = {
            Name: 'email',
            Value: email
        };
        var attributeEmail = new AmazonCognitoIdentity.CognitoUserAttribute(dataEmail);

        userPool.signUp(username, password, [attributeEmail], null,
            function signUpCallback(err, result) {
                if (!err) {
                    onSuccess(result);
                } else {
                    onFailure(err);
                }
            }
        );
    }

    function signin(username, password, onSuccess, onFailure) {
        var authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails({
            Username: username,
            Password: password
        });

        var cognitoUser = createCognitoUser(username);
        cognitoUser.authenticateUser(authenticationDetails, {
            onSuccess: onSuccess,
            onFailure: onFailure
        });
    }

    function verify(username, code, onSuccess, onFailure) {
        createCognitoUser(username).confirmRegistration(code, true, function confirmCallback(err, result) {
            if (!err) {
                onSuccess(result);
            } else {
                onFailure(err);
            }
        });
    }

    function createCognitoUser(email) {
        return new AmazonCognitoIdentity.CognitoUser({
            Username: email,
            Pool: userPool
        });
    }

    Harunow.changeGlobalVariable = function (newValue) {
        Harunow.Group = newValue;
    };

    /*
     *  Event Handlers
     */

    $(function onDocReady() {
        var currentUrl = window.location.href;
        
        if (currentUrl.includes('?verify')) {
            $("#verifyAlert").show();
            //showToast("Registration successful. Please check your email inbox or spam folder for your verification.", 'text-bg-success', 'Success');
        }
        $('#signinForm').submit(handleSignin);
        $('#registrationForm').submit(handleRegister);
        $('#verifyForm').submit(handleVerify);
        $('#resetPasswordForm').submit(handleResetPassword);
        $('#newPasswordForm').submit(handleNewPassword);
        $('[data-bs-toggle="tooltip"]').tooltip();
    });

    function handleSignin(event) {
        var username = $('#usernameInputSignin').val();
        var password = $('#passwordInputSignin').val();

        event.preventDefault();
        signin(username, password,
            function signinSuccess() {
                console.log('Successfully Logged In');
                window.location.href = '/';
            },
            function signinError(err) {
                showToast(err, 'text-bg-danger', 'Error');
            }
        );
    }
    var groupKey;
    var userType;
    function handleRegister(event) {
        groupKey = $('#keyInputRegister').val().trim();
        userType = $('input[name="btnradio"]:checked').val();
        var username = $('#usernameInputRegister').val();
        var email = $('#emailInputRegister').val();
        var password = $('#passwordInputRegister').val();
        var password2 = $('#password2InputRegister').val();
        event.preventDefault();

        // Check if the passwords match
        if (/\s/.test(username)) {
            showToast('Username cannot contain spaces', 'text-bg-danger', 'Error');
            return; // Stop further execution
        }

        $('#registrationButton').prop('disabled', true);
        //check school exists
        getSchool(groupKey, username, email, password, password2);

    }

    var onSuccess = function registerSuccess(result) {
        var cognitoUser = result.user;

        //var confirmation = "Registration successful. Please check your email inbox or spam folder for your verification. <a href='harunow.com/login/'>Go to login</a>";
        addUserToSchool(cognitoUser.getUsername(), groupKey, userType);
    };

    var onFailure = function registerFailure(err) {
        showToast(err, 'text-bg-danger', 'Error');
        $('#registrationButton').prop('disabled', false);
    };

    function registerUser(username, email, password, password2, onSuccess, onFailure) {
        if (password === password2) {
            register(username, email, password, onSuccess, onFailure);
        } else {
            showToast('Passwords do not match', 'text-bg-danger', 'Error');
            $('#registrationButton').prop('disabled', false);
        }
    }


    function getSchool(key, username, email, password, password2) {
        $.ajax({
            method: 'GET',
            url: _config.api.invokeUrl + '/school?groupKey=' + key.toLowerCase(),

            contentType: 'application/json',
            success: function (response) {
                // Continue with registration only if the school is found
                registerUser(username, email, password, password2, onSuccess, onFailure);
            },
            error: function ajaxError(jqXHR, textStatus, errorThrown) {
                showToast(jqXHR.responseText, 'text-bg-danger', 'An error occured when finding school');

                console.error('Error finding school: ', textStatus, ', Details: ', errorThrown);
                console.error('Response: ', jqXHR.responseText);
                $('#registrationButton').prop('disabled', false);
            },
        });
    }

    function addUserToSchool(username, key, userType) {

        $.ajax({
            method: 'POST',
            url: _config.api.invokeUrl + '/users',
            data: JSON.stringify({
                username: username.toLowerCase(),
                groupKey: key.toLowerCase(),
                userType: userType
            }),
            contentType: 'application/json',
            success: function (response) {
                //showToast(confirmation, 'text-bg-success', 'Success');
                window.location.href = signinUrl + "?verify";
            },
            error: function ajaxError(jqXHR, textStatus, errorThrown) {
                showToast(jqXHR.responseText, 'text-bg-danger', 'An error occured when adding school');

                console.error('Error adding school: ', textStatus, ', Details: ', errorThrown);
                console.error('Response: ', jqXHR.responseText);
            },
            complete: function () {
                $('#registrationButton').prop('disabled', false);
            }
        });
    }

    function handleVerify(event) {
        var username = $('#usernameInputVerify').val();
        var code = $('#codeInputVerify').val();
        event.preventDefault();
        verify(username, code,
            function verifySuccess(result) {
                console.log('call result: ' + result);
                console.log('Successfully verified');
                showToast('Verification successful. You will now be redirected to the login page.', 'text-bg-success', 'Success');
                window.location.href = signinUrl;
            },
            function verifyError(err) {
                showToast(err, 'text-bg-danger', 'Error');
            }
        );
    }

    function handleResetPassword(event) {
        var username = $('#username').val();
        event.preventDefault();

        // Call the Cognito API to initiate the password reset
        var cognitoUser = new AmazonCognitoIdentity.CognitoUser({
            Username: username,
            Pool: userPool
        });
        cognitoUser.forgotPassword({
            onSuccess: function () {
                window.location.href = "/login/reset-password/new/";
            },
            onFailure: function (err) {
                // Show error message
                showToast(err, 'text-bg-danger', 'Error');
            }
        });

    }

    function handleNewPassword(event) {
        event.preventDefault();
        var username = $('#username').val(); // Get the entered username
        var verificationCode = $('#verificationCode').val(); // Get the entered verification code
        var newPassword = $('#newPassword').val(); // Get the entered new password
        var confirmPassword = $('#confirmPassword').val(); // Get the entered confirm password

        // Check if the passwords match
        if (newPassword !== confirmPassword) {
            showToast('Passwords do not match', 'text-bg-danger', 'Error');
            return; // Stop further execution
        }

        // Call the Cognito API to set the new password with the verification code
        var cognitoUser = new AmazonCognitoIdentity.CognitoUser({
            Username: username,
            Pool: userPool
        });
        cognitoUser.confirmPassword(verificationCode, newPassword, {
            onSuccess: function () {
                // Show success message
                window.location.href = "/login/";
            },
            onFailure: function (err) {
                // Show error message
                showToast(err, 'text-bg-danger', 'Error');
            }
        });

    }
    function setAWS() {
        AWS.config.update({
            accessKeyId: authToken,
        });
        // Set the AWS credentials and region

        AWS.config.region = _config.cognito.region; // Set the AWS region
        // Set up Cognito identity credentials using the authentication token
        AWS.config.credentials = new AWS.CognitoIdentityCredentials({
            IdentityPoolId: _awsconfig.identityPool.identityPoolId,
            Logins: {
                [_awsconfig.identityPool.url]: authToken,
            },
        });
    }
    Harunow.uploadToS3 = async function (file) {
        setAWS();
        // Initialize the S3 client
        const s3 = new AWS.S3();

        // Specify the file details and upload to S3
        const fileName = file.name;
        let key = 'app/' + group + '/' + username + '/posts/' + fileName
        const params = {
            Bucket: 'bubblystorage',
            Key: key,
            Body: file,
        };
        try {
            return new Promise((resolve, reject) => {
                s3.upload(params, (err, data) => {
                    if (err) {
                        console.error('Error uploading file:', err);
                        reject(err);
                    } else {
                        resolve(key);
                    }
                });
            });
        } catch (error) {
            console.error('Upload failed:', error);
            throw error;
        }
    }

    Harunow.downloadFromS3 = async function (key) {
        setAWS();
        // Initialize the S3 client
        const s3 = new AWS.S3();

        const params = {
            Bucket: 'bubblystorage',
            Key: key,
        };
        try {
            return new Promise((resolve, reject) => {
                s3.getObject(params, (err, file) => {
                    if (err) {
                        resolve("");
                    } else {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                            const base64Data = reader.result.split(',')[1];
                            const dataUrl = `data:${file.ContentType};base64,${base64Data}`;
                            resolve(dataUrl);
                        };
                        reader.readAsDataURL(new Blob([file.Body]));
                    }
                });
            });

        } catch (error) {
            console.error('Error retrieving image from S3:', error);
            throw error;
        }
    }

    Harunow.listObjectsInFolder = async function (folderPath) {
        setAWS();
        // Initialize the S3 client
        const s3 = new AWS.S3();
        const params = {
            Bucket: 'bubblystorage',
            Prefix: folderPath, // Specify the folder path as a prefix
        };

        try {
            return new Promise((resolve, reject) => {
                s3.listObjectsV2(params, (err, data) => {
                    if (err) {
                        reject(err);
                    }
                    resolve(data.Contents);
                    //var href = this.request.httpRequest.endpoint.href;
                    //var bucketUrl = href + folderPath + '/';
                    /* var photos = data.Contents.map(function (photo) {
                        var photoKey = photo.Key;
                        var photoUrl = bucketUrl + encodeURIComponent(photoKey);
                        return `<img style="width:128px;height:128px;" src="${photoUrl}" />`;
                    }); */

                    //$("#albumPics").append(photos);
                });
            });
        } catch (error) {
            console.error('Error listing objects in folder:', error);
            throw error;
        }
    }



    function refreshAWSToken() {
        const cognitoUser = userPool.getCurrentUser();

        if (!cognitoUser) {
            console.log("No user found. Please log in first.");
            return;
        }

        cognitoUser.getSession(async function (err, session) {
            if (err) {
                console.error("Error getting the session:", err);
                return;
            }

            if (!session.isValid()) {
                console.log("Session not valid. Please log in again.");
                return;
            }

            try {
                // Use the refresh token to get a new session with a new access token
                const refreshedSession = await new Promise((resolve, reject) => {
                    cognitoUser.refreshSession(session.getRefreshToken(), (err, newSession) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(newSession);
                        }
                    });
                });

                // Get the new access token from the refreshed session
                const refreshedAccessToken = refreshedSession.getIdToken().getJwtToken();

                // Handle the refreshed token (store it, update session, etc.)
                console.log("Refreshed Access Token:", refreshedAccessToken);

                location.reload();

                // Optionally, you can update the UI or perform other actions here
            } catch (error) {
                showToast('Error refreshing AWS token', 'text-bg-danger', error);
            }
        });
    }

    Harunow.refreshAWSToken = refreshAWSToken;


}(jQuery));
