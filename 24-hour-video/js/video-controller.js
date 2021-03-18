var videoController = {
    data: {
        config: null
    },
    uiElements: {
        videoCardTemplate: null, 
        videoList: null
    }, 
    init: function(config) {
        // index.html 문서에 id 속성이 video-template, video-list인 요소를 참조
        this.uiElements.videoCardTemplate = $('#video-template');
        this.uiElements.videoList = $('#video-list');
 
        // config.js 파일에 있는 내용을 참조
        this.data.config = config;
 
        this.getVideoList();

        this.wireEventts();
    }, 
    // get-video-list API를 호출
    getVideoList: function() {
        var that = this;
 
        // get-video-list API 호출 URL + 리소스 이름
        // videos 리소스를 GET 방식으로 호출 --> get-video-list 람다 함수를 실행하고 결과를 반환 받음
        var url = this.data.config.getFileListApiUrl + '/videos';
        $.get(url, function(data, status) {
            that.updateVideoFrontPage(data);
        });
    }, 
    // get-video-list 람다 함수의 실행 결과를 목록으로 화면에 출력
    updateVideoFrontPage: function(data) {
        console.log(data);
        
        var baseUrl = data.baseUrl;
        var urls = data.urls;
        
        /*
        var url = urls[0];
        var key = url.Key;
        var filename = key.split('/')[1];

        //var litag = '<li url="' + baseUrl + '/' + key + '">' + filename + '</li>';
        var litag = `<li url="${baseUrl}/${key}">${filename}</li>`;
        console.log(litag);

        $('#video-list').append(litag);
        */

        urls.forEach(url => {
            var key = url.Key;
            var filename = key.split('/')[1];
            var litag = `<li url="${baseUrl}/${key}">${filename}</li>`;

            $('#video-list').append(litag);
        });
    },

    // 이벤트를 처리하는 함수(이벤트 핸들러)를 정의
    wireEventts: function() {
        $('#video-list').on('click', 'li', function() {
            var url = $(this).attr('url');
            console.log(url);

            $('source').attr('src', url);
            $('video').load();
        });
    }
};
