(function () {
  function setupPlayer(player) {
    var video = player.querySelector('video');
    var button = player.querySelector('.player-cover-button');
    if (!video || !button) return;

    var source = video.getAttribute('data-src');
    var hls = null;
    var initialized = false;

    function attachSource() {
      if (initialized || !source) return;
      initialized = true;

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false,
          backBufferLength: 90
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) return;
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          } else {
            hls.destroy();
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else {
        video.src = source;
      }
    }

    function startPlayback() {
      attachSource();
      player.classList.add('is-started');
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          video.controls = true;
        });
      }
    }

    button.addEventListener('click', startPlayback);
    video.addEventListener('play', function () {
      player.classList.add('is-started');
    });
    video.addEventListener('pause', function () {
      video.controls = true;
    });
    window.addEventListener('beforeunload', function () {
      if (hls) hls.destroy();
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(setupPlayer);
  });
})();
