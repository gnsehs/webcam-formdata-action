const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
const captureButton = document.getElementById('captureButton');

// 웹캠 스트림 시작
navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
        video.srcObject = stream;
        video.play();
    })
    .catch(err => {
        console.error('Error accessing the webcam: ' + err);
    });

// 음성 인식을 위한 SpeechRecognition 객체 생성
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.lang = 'ko-KR'; // 한국어 설정
recognition.interimResults = false; // 중간 결과 표시하지 않음
recognition.maxAlternatives = 1;

let recognizedText = '';

// 음성 인식 결과 처리
recognition.onresult = (event) => {
    recognizedText = event.results[0][0].transcript; // 음성 인식된 텍스트
    console.log('Recognized Speech:', recognizedText);
};

// 버튼 클릭 시 이미지 캡처 및 음성 인식
captureButton.addEventListener('click', () => {
    // 음성 인식 시작
    recognition.start();

    // 음성 인식이 끝났을 때 처리
    recognition.onend = () => {
        // 캔버스에 현재 비디오 프레임 그리기
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // 캔버스 데이터를 Blob으로 변환
        canvas.toBlob(blob => {
            // FormData 객체 생성
            const formData = new FormData();
            formData.append('image', blob, 'capture.jpg');  // 'image' 필드로 Blob 추가
            formData.append('text', recognizedText);  // 음성 인식 텍스트 추가

            // 서버에 이미지 및 음성 인식 결과 전송 (multipart/form-data)
            fetch('http://localhost:8080/ai-form', {
                method: 'POST',
                body: formData
            })
                .then(response => response.json())
                .then(data => {
                    console.log(data.status);
                })
                .catch(error => {
                    console.error('Error:', error);
                });
        }, 'image/jpeg');  // JPEG 형식으로 변환
    };
});
