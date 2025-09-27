class PremiumMoviePlatform {
    constructor() {
        this.movies = this.loadMovies();
        this.currentRating = 0;
        this.init();
        this.createBackgroundAnimation();
    }

    loadMovies() {
        try {
            return JSON.parse(localStorage.getItem('movies')) || [];
        } catch (error) {
            console.warn('localStorage not available, using temporary storage');
            return [];
        }
    }

    init() {
        this.setupEventListeners();
        this.displayMovies();
        this.updateStats();
        this.hideSuccessMessage();
    }

    createBackgroundAnimation() {
        const bgAnimation = document.getElementById('bgAnimation');
        if (!bgAnimation) return;
        
        for (let i = 0; i < 20; i++) {
            const particle = document.createElement('div');
            particle.classList.add('particle');
            particle.style.left = Math.random() * 100 + '%';
            particle.style.top = Math.random() * 100 + '%';
            particle.style.width = Math.random() * 6 + 4 + 'px';
            particle.style.height = particle.style.width;
            particle.style.animationDelay = Math.random() * 6 + 's';
            particle.style.animationDuration = (Math.random() * 4 + 4) + 's';
            bgAnimation.appendChild(particle);
        }
    }

    setupEventListeners() {
        // Rating system
        const stars = document.querySelectorAll('.star');
        const ratingInput = document.querySelector('.rating-input');
        
        stars.forEach(star => {
            star.addEventListener('click', (e) => {
                const rating = parseInt(e.target.dataset.rating);
                this.setRating(rating);
            });
            
            star.addEventListener('mouseover', (e) => {
                const rating = parseInt(e.target.dataset.rating);
                this.highlightStars(rating);
            });
        });

        if (ratingInput) {
            ratingInput.addEventListener('mouseleave', () => {
                this.highlightStars(this.currentRating);
            });
        }

        // Form submission
        const movieForm = document.getElementById('movieForm');
        if (movieForm) {
            movieForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addMovie();
            });
        }

        // Filters
        const genreFilter = document.getElementById('genreFilter');
        const sortBy = document.getElementById('sortBy');
        
        if (genreFilter) {
            genreFilter.addEventListener('change', () => {
                this.displayMovies();
            });
        }

        if (sortBy) {
            sortBy.addEventListener('change', () => {
                this.displayMovies();
            });
        }
    }

    setRating(rating) {
        this.currentRating = rating;
        this.highlightStars(rating);
        
        const ratingValue = document.getElementById('ratingValue');
        if (ratingValue) {
            ratingValue.textContent = '(' + rating + '/5 stars)';
        }
        
        // Add animation to selected stars
        const stars = document.querySelectorAll('.star');
        stars.forEach((star, index) => {
            if (index < rating) {
                star.style.animation = 'starGlow 0.6s ease';
                setTimeout(() => {
                    star.style.animation = '';
                }, 600);
            }
        });
    }

    highlightStars(rating) {
        const stars = document.querySelectorAll('.star');
        stars.forEach((star, index) => {
            if (index < rating) {
                star.classList.add('active');
            } else {
                star.classList.remove('active');
            }
        });
    }

    showSuccessMessage() {
        const successMsg = document.getElementById('successMessage');
        if (successMsg) {
            successMsg.classList.add('show');
            setTimeout(() => {
                successMsg.classList.remove('show');
            }, 3000);
        }
    }

    hideSuccessMessage() {
        const successMsg = document.getElementById('successMessage');
        if (successMsg) {
            successMsg.classList.remove('show');
        }
    }

    addMovie() {
        const titleInput = document.getElementById('movieTitle');
        const genreInput = document.getElementById('movieGenre');
        const yearInput = document.getElementById('movieYear');
        const posterInput = document.getElementById('moviePoster');
        const reviewInput = document.getElementById('movieReview');

        if (!titleInput || !genreInput) return;

        const title = titleInput.value.trim();
        const genre = genreInput.value;
        const year = yearInput ? yearInput.value : '';
        const poster = posterInput ? posterInput.value.trim() : '';
        const review = reviewInput ? reviewInput.value.trim() : '';

        if (!title) {
            this.showNotification('Please enter a movie title', 'error');
            return;
        }

        if (this.currentRating === 0) {
            this.showNotification('Please select a rating', 'error');
            return;
        }

        const movie = {
            id: Date.now(),
            title: title,
            genre: genre,
            year: year || 'Unknown',
            poster: poster || '',
            rating: this.currentRating,
            review: review,
            dateAdded: new Date().toISOString()
        };

        this.movies.push(movie);
        this.saveMovies();
        this.displayMovies();
        this.updateStats();
        this.resetForm();
        this.showSuccessMessage();
    }

    deleteMovie(id) {
        if (confirm('Are you sure you want to delete this movie?')) {
            this.movies = this.movies.filter(movie => movie.id !== id);
            this.saveMovies();
            this.displayMovies();
            this.updateStats();
        }
    }

    resetForm() {
        const movieForm = document.getElementById('movieForm');
        if (movieForm) {
            movieForm.reset();
        }
        
        this.currentRating = 0;
        this.highlightStars(0);
        
        const ratingValue = document.getElementById('ratingValue');
        if (ratingValue) {
            ratingValue.textContent = '(Click to rate)';
        }
    }

    saveMovies() {
        try {
            localStorage.setItem('movies', JSON.stringify(this.movies));
        } catch (error) {
            console.warn('localStorage not available, movies will not persist');
        }
    }

    displayMovies() {
        const genreFilter = document.getElementById('genreFilter');
        const sortBy = document.getElementById('sortBy');
        const grid = document.getElementById('moviesGrid');

        if (!grid) return;

        const genreFilterValue = genreFilter ? genreFilter.value : '';
        const sortByValue = sortBy ? sortBy.value : 'title';

        let filteredMovies = [...this.movies];

        if (genreFilterValue) {
            filteredMovies = filteredMovies.filter(movie => movie.genre === genreFilterValue);
        }

        filteredMovies.sort((a, b) => {
            switch (sortByValue) {
                case 'title':
                    return a.title.localeCompare(b.title);
                case 'rating':
                    return b.rating - a.rating;
                case 'year':
                    const yearA = a.year === 'Unknown' ? 0 : parseInt(a.year);
                    const yearB = b.year === 'Unknown' ? 0 : parseInt(b.year);
                    return yearB - yearA;
                case 'dateAdded':
                    return new Date(b.dateAdded) - new Date(a.dateAdded);
                default:
                    return 0;
            }
        });

        if (filteredMovies.length === 0) {
            const noMoviesMessage = this.movies.length === 0 ? 
                'No movies added yet. Add your first movie above!' : 
                'No movies found matching your criteria.';
            
            grid.innerHTML = '<div class="no-movies">' +
                '<i class="fas fa-film" style="font-size: 3rem; margin-bottom: 20px; opacity: 0.5;"></i>' +
                '<br>' + noMoviesMessage +
                '</div>';
            return;
        }

        grid.innerHTML = filteredMovies.map((movie, index) => this.createMovieCard(movie, index)).join('');

        // Add stagger animation delay
        const movieCards = document.querySelectorAll('.movie-card');
        movieCards.forEach((card, index) => {
            card.style.setProperty('--i', index);
        });

        // Add delete button event listeners
        const deleteButtons = document.querySelectorAll('.delete-btn');
        deleteButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const movieId = parseInt(btn.dataset.id);
                this.deleteMovie(movieId);
            });
        });
    }

    createMovieCard(movie, index) {
        const starsArray = [];
        for (let i = 0; i < 5; i++) {
            const activeClass = i < movie.rating ? 'active' : '';
            starsArray.push('<span class="star ' + activeClass + '">★</span>');
        }
        const starsHtml = starsArray.join('');

        const posterHtml = movie.poster ? 
            '<img src="' + movie.poster + '" alt="' + this.escapeHtml(movie.title) + '" class="movie-poster" onerror="this.outerHTML=\'<div class=\\\'poster-placeholder\\\'>🎬</div>\'">' : 
            '<div class="poster-placeholder">🎬</div>';

        const reviewHtml = movie.review ? 
            '<div class="movie-review">"' + this.escapeHtml(movie.review) + '"</div>' : '';

        return '<div class="movie-card" style="--i: ' + index + '">' +
            posterHtml +
            '<div class="movie-info">' +
                '<div class="movie-title">' + this.escapeHtml(movie.title) + '</div>' +
                '<div class="movie-meta">' +
                    '<span class="movie-genre">' + movie.genre + '</span>' +
                    '<span class="movie-year">' + movie.year + '</span>' +
                '</div>' +
                '<div class="movie-rating">' +
                    '<div class="rating-stars">' + starsHtml + '</div>' +
                    '<span class="rating-number">' + movie.rating + '/5</span>' +
                '</div>' +
                reviewHtml +
                '<button class="delete-btn" data-id="' + movie.id + '">' +
                    '<i class="fas fa-trash"></i> Delete' +
                '</button>' +
            '</div>' +
        '</div>';
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    updateStats() {
        const totalMovies = this.movies.length;
        
        const avgRating = totalMovies > 0 ? 
            (this.movies.reduce((sum, movie) => sum + movie.rating, 0) / totalMovies).toFixed(1) : 
            '0.0';
        
        const genreCounts = {};
        this.movies.forEach(movie => {
            genreCounts[movie.genre] = (genreCounts[movie.genre] || 0) + 1;
        });
        
        const topGenre = Object.keys(genreCounts).length > 0 ? 
            Object.keys(genreCounts).reduce((a, b) => genreCounts[a] > genreCounts[b] ? a : b) : 
            '-';

        // Update stats display
        this.animateNumber('totalMovies', totalMovies);
        this.animateNumber('avgRating', avgRating);
        
        const topGenreElement = document.getElementById('topGenre');
        if (topGenreElement) {
            topGenreElement.textContent = topGenre;
        }
    }

    animateNumber(elementId, targetValue) {
        const element = document.getElementById(elementId);
        if (!element) return;

        const currentValue = parseFloat(element.textContent) || 0;
        const targetNum = parseFloat(targetValue);
        const increment = (targetNum - currentValue) / 20;
        let current = currentValue;

        const timer = setInterval(() => {
            current += increment;
            if ((increment > 0 && current >= targetNum) || (increment < 0 && current <= targetNum)) {
                element.textContent = targetValue;
                clearInterval(timer);
            } else {
                if (elementId === 'avgRating') {
                    element.textContent = current.toFixed(1);
                } else {
                    element.textContent = Math.round(current);
                }
            }
        }, 50);
    }

    showNotification(message, type) {
        // Remove any existing notifications
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notif => {
            if (notif.parentNode) {
                notif.parentNode.removeChild(notif);
            }
        });

        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'notification ' + type;
        
        const icon = type === 'error' ? 'fa-exclamation-circle' : 'fa-check-circle';
        notification.innerHTML = '<i class="fas ' + icon + '"></i> ' + message;
        
        // Apply styles
        notification.style.position = 'fixed';
        notification.style.top = '20px';
        notification.style.right = '20px';
        notification.style.background = type === 'error' ? '#ff4757' : '#2ed573';
        notification.style.color = 'white';
        notification.style.padding = '15px 25px';
        notification.style.borderRadius = '10px';
        notification.style.boxShadow = '0 5px 15px rgba(0,0,0,0.2)';
        notification.style.zIndex = '1000';
        notification.style.transform = 'translateX(100%)';
        notification.style.transition = 'transform 0.3s ease';
        notification.style.fontWeight = '600';
        notification.style.display = 'flex';
        notification.style.alignItems = 'center';
        notification.style.gap = '10px';

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    new PremiumMoviePlatform();
    
    // Add interactive effects
    document.addEventListener('mousemove', function(e) {
        const cards = document.querySelectorAll('.movie-card');
        cards.forEach(function(card) {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            if (x > 0 && x < rect.width && y > 0 && y < rect.height) {
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const rotateX = (y - centerY) / 10;
                const rotateY = (centerX - x) / 10;
                
                card.style.transform = 'translateY(-15px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg)';
            }
        });
    });
});