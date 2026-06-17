(function () {
  function setupPlayer(stage) {
    var video = stage.querySelector('video');
    var overlay = stage.querySelector('.player-overlay');
    var streamUrl = stage.getAttribute('data-stream');
    var attached = false;

    if (!video || !overlay || !streamUrl) {
      return;
    }

    function attachStream() {
      if (attached) {
        return;
      }
      attached = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
        return;
      }

      var HlsClass = window.Hls || window.LocalHls;
      if (HlsClass && HlsClass.isSupported && HlsClass.isSupported()) {
        var hls = new HlsClass();
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        stage.hlsPlayer = hls;
      } else {
        video.src = streamUrl;
      }
    }

    function startPlayback(event) {
      if (event) {
        event.preventDefault();
      }
      attachStream();
      stage.classList.add('is-playing');
      overlay.hidden = true;
      var playRequest = video.play();
      if (playRequest && typeof playRequest.catch === 'function') {
        playRequest.catch(function () {
          overlay.hidden = false;
          stage.classList.remove('is-playing');
        });
      }
    }

    overlay.addEventListener('click', startPlayback);
    stage.addEventListener('click', function (event) {
      if (event.target === overlay || overlay.contains(event.target)) {
        return;
      }
      if (!attached && (event.target === video || event.target === stage)) {
        startPlayback(event);
      }
    });
    video.addEventListener('play', function () {
      stage.classList.add('is-playing');
      overlay.hidden = true;
    });
    video.addEventListener('ended', function () {
      overlay.hidden = false;
      stage.classList.remove('is-playing');
    });
  }

  document.querySelectorAll('.player-stage').forEach(setupPlayer);
})();
