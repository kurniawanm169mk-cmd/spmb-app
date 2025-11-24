import React, { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Carousel = ({ slides = [] }) => {
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
    const [selectedIndex, setSelectedIndex] = useState(0);

    const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
    const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

    const onSelect = useCallback(() => {
        if (!emblaApi) return;
        setSelectedIndex(emblaApi.selectedScrollSnap());
    }, [emblaApi]);

    useEffect(() => {
        if (!emblaApi) return;
        onSelect();
        emblaApi.on('select', onSelect);

        // Auto-play
        const interval = setInterval(() => {
            if (emblaApi) emblaApi.scrollNext();
        }, 5000);

        return () => clearInterval(interval);
    }, [emblaApi, onSelect]);

    if (!slides || slides.length === 0) {
        return (
            <div className="carousel-placeholder" style={{
                height: '500px',
                backgroundColor: '#e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 'var(--radius-lg)'
            }}>
                <p style={{ color: 'var(--text-secondary)' }}>Belum ada foto kegiatan sekolah</p>
            </div>
        );
    }

    return (
        <div className="carousel" style={{ position: 'relative', overflow: 'hidden', borderRadius: 'var(--radius-lg)' }}>
            <div className="embla" ref={emblaRef}>
                <div className="embla__container" style={{ display: 'flex' }}>
                    {slides.map((slide, index) => (
                        <div className="embla__slide" key={index} style={{ flex: '0 0 100%', minWidth: 0, position: 'relative' }}>
                            <img
                                src={slide.image_url}
                                alt={slide.caption || `Slide ${index + 1}`}
                                style={{
                                    width: '100%',
                                    height: '500px',
                                    objectFit: 'cover',
                                    display: 'block'
                                }}
                            />
                            {slide.caption && (
                                <div style={{
                                    position: 'absolute',
                                    bottom: 0,
                                    left: 0,
                                    right: 0,
                                    padding: '1rem',
                                    background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
                                    color: 'white'
                                }}>
                                    <p>{slide.caption}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <button
                onClick={scrollPrev}
                style={{
                    position: 'absolute',
                    left: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    backgroundColor: 'rgba(255,255,255,0.8)',
                    borderRadius: '50%',
                    padding: '0.5rem',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <ChevronLeft size={24} color="var(--text-primary)" />
            </button>

            <button
                onClick={scrollNext}
                style={{
                    position: 'absolute',
                    right: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    backgroundColor: 'rgba(255,255,255,0.8)',
                    borderRadius: '50%',
                    padding: '0.5rem',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <ChevronRight size={24} color="var(--text-primary)" />
            </button>

            <div style={{
                position: 'absolute',
                bottom: '1rem',
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                gap: '0.5rem'
            }}>
                {slides.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => emblaApi && emblaApi.scrollTo(index)}
                        style={{
                            width: '10px',
                            height: '10px',
                            borderRadius: '50%',
                            border: 'none',
                            backgroundColor: index === selectedIndex ? 'white' : 'rgba(255,255,255,0.5)',
                            cursor: 'pointer'
                        }}
                    />
                ))}
            </div>
        </div>
    );
};

export default Carousel;
