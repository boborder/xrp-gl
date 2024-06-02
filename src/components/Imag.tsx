import Image from "next/image";

type ImagineProps = {
    src: string;
    alt: string;
    width?: number;
    height?: number;
    quality?: number;
    priority?: boolean;
    fill?: boolean;
    sizes?: string;
    placeholder?: "empty" | "blur";
    className?: string;
    onClick?: () => void;
};
type ImageLoaderProps = {
    src: string;
    width: number;
    quality?: number;
};

export const Imag: React.FC<ImagineProps> = ({
    src,
    alt,
    width,
    height,
    quality,
    priority,
    fill,
    sizes,
    placeholder,
    className,
    onClick
}) => {
    // webpに変換してリサイズ
    const imageLoader = ({ src, width, quality }: ImageLoaderProps) => {
        const MAX_WIDTH = 640;
        const resizeWidth = width > MAX_WIDTH ? MAX_WIDTH : width;
        return `${src}?w=${resizeWidth}&q=${quality || 75}&fm=webp`;
    };

    return (
        <>
            {fill ? (
                <div onClick={onClick} className={className + "relative"}>
                    <Image
                        loader={imageLoader}
                        src={src}
                        alt={alt}
                        width={width}
                        height={height}
                        quality={quality}
                        priority={priority}
                        fill={fill}
                        sizes={sizes}
                        placeholder={placeholder}
                        className={"object-cover hover:scale-105"}
                    />
                </div>
            ) : (
                <Image
                    loader={imageLoader}
                    src={src}
                    alt={alt}
                    width={width}
                    height={height}
                    quality={quality}
                    priority={priority}
                    fill={fill}
                    sizes={sizes}
                    placeholder={placeholder}
                    onClick={onClick}
                    className={className + "object-cover hover:scale-105 cursor-pointer"}
                />
            )}
        </>
    );
};
