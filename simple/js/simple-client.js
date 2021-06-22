var webcaster = {
    uri: "ws://dj_test:djtest123@144.126.220.27/radio/8005/",
    isStreaming: true,
    bitrate: 256,
    samplerate: 44100,
    encoder: 'mp3',
    asynchronous: true,
    passThrough: false,
    metadata: {
        title: '',
        artist: ''
    },
};

webcaster.startStreaming = function() {
    stream.init();

    var encoderClass;

    switch (this.encoder) {
        case 'mp3':
            encoderClass = Webcast.Encoder.Mp3;
            break;
        case 'raw':
            encoderClass = Webcast.Encoder.Raw;
    }

    let encoder = new encoderClass({
        channels: 2,
        samplerate: this.samplerate,
        bitrate: this.bitrate
    });

    if (this.samplerate !== stream.context.sampleRate) {
        encoder = new Webcast.Encoder.Resample({
            encoder: encoder,
            type: Samplerate.LINEAR,
            samplerate: stream.context.sampleRate
        });
    }

    stream.webcast.connectSocket(encoder, this.uri);
    this.isStreaming = true;
}

webcaster.stopStreaming = function() {
    stream.webcast.close();
    this.isStreaming = false;
}

webcaster.resumeStream = function() {
    stream.resumeContext();
}

webcaster.toggleRecording = function() {

    if (track.playing) {
        track.stop();
    } else {
        track.prepare();
        this.createSource(() => {
            this.playing = true;
            this.paused = false;
        });
    }
}

webcaster.createSource = function(cb) {
    var constraints;
    if (track.source != null) {
        track.source.disconnect(this.destination);
    }
    constraints = {
        video: false
    };
    if (this.device) {
        constraints.audio = {
            deviceId: this.device
        };
    } else {
        constraints.audio = true;
    }
    return stream.createMicrophoneSource(constraints, (source) => {
        track.source = source;
        track.source.connect(track.destination);
        return typeof cb === 'function' ? cb() : void 0;
    });
}

$(document).ready(function() {
    $('.start-stream').on('click', function(e) {
        e.preventDefault();
        webcaster.startStreaming();
        $(this).hide();
        $('.stop-stream').show();
    });

    $('.stop-stream').on('click', function(e) {
        e.preventDefault();
        webcaster.stopStreaming();
        $(this).hide();
        $('.start-stream').show();
    });

    $('button.record-audio').on('click', function(e) {
        e.preventDefault();
        webcaster.toggleRecording();
    });
});