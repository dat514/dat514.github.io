document.addEventListener('DOMContentLoaded', function() {
    var typed = new Typed('#typewriter', {
        strings: ["The environment is everything that isn’t me"],
        typeSpeed: 100,
        showCursor: false
    });

    const volumeToggle = document.querySelector('.volume-toggle');
    const volumeControl = document.querySelector('.volume-control');
    const audio = document.getElementById('background-music');
    const volumeSlider = document.getElementById('volume');

    if (!volumeToggle || !volumeControl || !audio || !volumeSlider) {
        console.error('Một hoặc nhiều phần tử không được tìm thấy!');
        return;
    }

    audio.volume = volumeSlider.value;

    volumeToggle.addEventListener('click', function() {
        audio.muted = !audio.muted;
        if (audio.muted) {
            volumeToggle.classList.remove('unmute');
            volumeToggle.classList.add('mute');
        } else {
            volumeToggle.classList.remove('mute');
            volumeToggle.classList.add('unmute');
        }
        volumeToggle.classList.add('pulse');
        setTimeout(() => {
            volumeToggle.classList.remove('pulse');
        }, 300);
    });

    volumeSlider.addEventListener('input', function() {
        audio.volume = this.value;
        if (audio.muted && this.value > 0) {
            audio.muted = false;
            volumeToggle.classList.remove('mute');
            volumeToggle.classList.add('unmute');
        }
    });

    let viewCount = parseInt(localStorage.getItem('pageViews')) || 0;
    if (!localStorage.getItem('viewCounted')) {
        viewCount++;
        localStorage.setItem('pageViews', viewCount);
        localStorage.setItem('viewCounted', 'true');
    }
    document.getElementById('view-count').textContent = viewCount;

    async function fetchStatus() {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
    
        try {
            const response = await fetch('https://d089-2405-4802-79dd-33c0-3871-9055-2d36-30c6.ngrok-free.app/status', { signal: controller.signal });
            clearTimeout(timeoutId);
    
            if (!response.ok) {
                throw new Error('Server không phản hồi');
            }
    
            const data = await response.json();
            console.log('Dữ liệu từ server:', data);

            const status = data.status || 'offline';
            const activities = data.activities || [];
            let statusText;
            let statusColor = '';
            const discordStatusColor = getComputedStyle(document.documentElement).getPropertyValue('--discord-status-color').trim() || '#FFFFFF';
            const discordLogo = `<span style="color: ${discordStatusColor}"> Discord Status:</span>`;
    
            switch (status) {
                case 'online':
                    statusText = 'Online';
                    statusColor = 'color: #00FF00';
                    break;
                case 'idle':
                    statusText = 'Idle';
                    statusColor = 'color: #FFA500';
                    break;
                case 'dnd':
                    statusText = 'Do Not Disturb';
                    statusColor = 'color: #FF4500';
                    break;
                case 'offline':
                    statusText = 'Offline';
                    statusColor = 'color: #FF0000';
                    break;
                default:
                    statusText = 'Không Xác Định';
                    statusColor = 'color: #FFFFFF';
            }
    
            let activityInfo = 'Không Có Hoạt Động Nào Đang Diễn Ra';
            let gameAvatarUrl = null; // Không đặt giá trị mặc định cho gameAvatarUrl
            let playTime = '(00:00:00)';
    
            if (activities.length > 0) {
                const activity = activities[0];
                const startTime = activity.createdTimestamp ? new Date(activity.createdTimestamp) : null;
    
                if (startTime) {
                    const now = new Date();
                    const diffMs = now - startTime;
                    const hours = Math.floor(diffMs / 3600000);
                    const minutes = Math.floor((diffMs % 3600000) / 60000);
                    const seconds = Math.floor((diffMs % 60000) / 1000);
                    playTime = ` (${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')})`;
                }
    
                activityInfo = `Đang chơi: ${activity.name || 'Không rõ'} - ${activity.details || ''} ${activity.state || ''} ${playTime}`;
    
                if (activity.largeImage) {
                    const largeImage = activity.largeImage;
                    if (largeImage.startsWith('mp:external')) {
                        const imagePath = largeImage.split('/').slice(2).join('/');
                        gameAvatarUrl = `https://${imagePath}`; // Tải trực tiếp từ GitHub
                    } else if (activity.applicationId) {
                        gameAvatarUrl = `https://cdn.discordapp.com/app-assets/${activity.applicationId}/${largeImage}.png`;
                    } else {
                        console.warn('Không có applicationId để tạo URL ảnh với largeImage:', largeImage);
                    }
                } else {
                    console.warn('Không có thông tin largeImage cho activity:', activity);
                }
                console.log('Game Avatar URL:', gameAvatarUrl);
            } else {
                console.log('Không có hoạt động nào từ server:', data);
            }
    
            const discordStatus = document.getElementById('discord-status');
            // Chỉ hiển thị hình ảnh nếu có gameAvatarUrl (tức là có hoạt động và có ảnh)
            if (gameAvatarUrl) {
                discordStatus.innerHTML = `
                    <div style="display: flex; align-items: center; justify-content: space-between; gap: 10px;">
                        <div>
                            <div style="${statusColor}">${discordLogo} ${statusText}</div>
                            <div>${activityInfo}</div>
                        </div>
                        <img src="${gameAvatarUrl}" alt="Game Avatar" style="width:90px; height:70px; border-radius:5px; object-fit:cover;" onerror="console.error('Lỗi tải ảnh:', this.src); this.src='https://placehold.co/90x70';">
                    </div>
                `;
            } else {
                discordStatus.innerHTML = `
                    <div style="display: flex; align-items: center; justify-content: space-between; gap: 10px;">
                        <div>
                            <div style="${statusColor}">${discordLogo} ${statusText}</div>
                            <div>${activityInfo}</div>
                        </div>
                    </div>
                `;
            }
        } catch (error) {
            clearTimeout(timeoutId);
            console.error('Lỗi khi lấy trạng thái:', error);
            const discordStatusColor = getComputedStyle(document.documentElement).getPropertyValue('--discord-status-color').trim() || '#FFFFFF';
            const discordLogo = `<span style="color: ${discordStatusColor}"> Discord Status:</span>`;
            document.getElementById('discord-status').innerHTML = `
                <div style="display: flex; align-items: center; justify-content: space-between; gap: 10px;">
                    <div>
                        <div style="color: #FF0000">${discordLogo} Offline</div>
                        <div>Không Có Hoạt Động Nào Đang Diễn Ra</div>
                    </div>
                </div>
            `;
        }
    }
    
    fetchStatus();
    setInterval(fetchStatus, 5000);
});
