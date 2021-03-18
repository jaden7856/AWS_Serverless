// userController 객체를 선언
var userController = {
    data: {
        auth0Lock: null,
        config: null
    }, 
    // HTML 문서에서 제어할 요소들(버튼, 이미지, 라벨, ... 등)
    uiElements: {
        loginButton: null,
        logoutButton: null, 
        profileButton: null, 
        profileNameLabel: null,
        profileImage: null
    }, 
    // 설정 정보와 제어할 요소들을 초기화
    init: function (config) {
        var that = this;
 
        // HTML 문서에서 id 속성의 값이 auth0-login인 요소를 가져와서 loginButton 변수에 할당
        // <button id="auth0-login" class="btn btn-success">Sign in</button>
        this.uiElements.loginButton = $('#auth0-login');
        this.uiElements.logoutButton = $('#auth0-logout');
        this.uiElements.profileButton = $('#user-profile');
        this.uiElements.profileNameLabel = $('#profilename');
        this.uiElements.profileImage = $('#profilepicture');
 
        // config.js의 포함되어 있는 설정 정보를 변수에 할당
        this.data.config = config;

        // 로그인 이후에 사용자 정보(프로필)를 조회할 때 필요한 토큰
        var auth0Option = {
            auth: {
                responseType: 'token id_token'
            }
        };
 
        this.data.auth0Lock = new Auth0Lock(config.auth0.clientId, config.auth0.domain, auth0Option);
        
        this.configureAuthenticatedRequests();
        
        // 로컬 스토리지에 accessToken이 존재하면 
        var accessToken = localStorage.getItem('accessToken');
        if (accessToken) {
            // 사용자의 프로필을 조회
            this.data.auth0Lock.getProfile(accessToken, function (err, profile) {
                if (err) {
                    return alert('프로필을 가져오는데 실패했습니다. ' + err.message);
                }
                // 사용자 프로필 조회에 성공하면 프로필 정보를 showUserAuthenticationDetails 함수로 전달
                that.showUserAuthenticationDetails(profile);
            });
        }
        // 이벤트 핸들러를 정의
        this.wireEvents();
    },
    // 로컬 스토리지에 저장된 idToken, accessToken을 Authorization, AccessToken 요청 헤더의 값으로 설정
    // => 요청 헤더의 값으로 설정되려면, 로컬 스토리지에 해당 값들이 존재해야 함
    configureAuthenticatedRequests: function() {
        $.ajaxSetup({
            'beforeSend': function (xhr) {
                console.log(xhr);
                xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('idToken'));
                xhr.setRequestHeader('AccessToken', localStorage.getItem('accessToken'));
            }
        })
    }, 
    // 전달받은 프로필 정보를 사용자 화면에 출력
    showUserAuthenticationDetails: function(profile) {
        // 프로필 정보 여부를 참, 거짓으로 설정
        // profile 변수가 null, undefined, ''인 경우 ==> false를 할당
        // profile 변수가 값이 있는 경우 ==> true를 할당
        var showAuthenticationElements = !!profile;
 
        // 프로필 정보가 존재하면 사용자 이름과 사진을 출력
        if (showAuthenticationElements) {
            this.uiElements.profileNameLabel.text(profile.nickname);
            this.uiElements.profileImage.attr('src', profile.picture);
        }
        // 프로필 정보가 존재하면 로그인 버튼을 감추고, 로그아웃 버튼과 프로필 버튼을 나타나게 처리
        this.uiElements.loginButton.toggle(!showAuthenticationElements);
        this.uiElements.logoutButton.toggle(showAuthenticationElements);
        this.uiElements.profileButton.toggle(showAuthenticationElements);
    }, 
    // 특정 이벤트에 반응하는 함수를 정의
    wireEvents: function() {
        var that = this;

        // Show profile 버튼 클릭 이벤트 핸들러
        this.uiElements.profileButton.click(function(e) {
            // user-profile 리소스 호출 URL
            var url = that.data.config.apiBaseUrl + '/user-profile';

            // 지정된 URL 주소로 GET 방식의 요청을 전달
            $.get(url, function(data, status) {
                console.log('data', data);
                console.log('status', status);
            }).fail(function(e) {
                console.log(e);
            });
        });
 
        // auth0 lock에서 제공하는 로그인 창에서 authenticated 이벤트가 발생하는 경우 
        // 수행할 함수를 정의
        this.data.auth0Lock.on('authenticated', function(authResult) {
            // 로그인에 성공하면 accessToken, idToken 값을 로컬 스토리지에 저장
            console.log(authResult);
            localStorage.setItem('accessToken', authResult.accessToken);
            localStorage.setItem('idToken', authResult.idToken);
 
            // 로그인에 성공하면 사용자 정보를 조회
            that.data.auth0Lock.getUserInfo(authResult.accessToken, function (error, profile) {
                // 사용자 정보 조회에 성공하면 반환받은 profile 정보를 showUserAuthenticationDetails 함수로 전달
                if (!error) {
                    that.showUserAuthenticationDetails(profile);
                }
            });
        });
 
        // 로그인 버튼을 클릭했을 때 처리 -> auth0 lock에서 제공하는 로그인 화면을 실행
        this.uiElements.loginButton.click(function(e) {
            that.data.auth0Lock.show();
        });
 
        // 로그아웃 버튼을 클릭했을 때 처리 
        //  -> 로컬 스토리지에 저장된 accessToken, idToken을 삭제
        //  -> 로그 아웃, 프로필 버튼을 숨기고, 로그인 버튼을 나타나게 처리
        this.uiElements.logoutButton.click(function(e) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('idToken');
            that.uiElements.logoutButton.hide();
            that.uiElements.profileButton.hide();
            that.uiElements.loginButton.show();
        });
    }
};
