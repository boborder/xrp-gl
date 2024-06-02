"use client"
import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import AvatarEditor from 'react-avatar-editor';
import { Imag } from "@/components/Imag"
import { useUser } from "@/components/UserProvider"

type UserProfile = {
    avatar?: string;
    name?: string;
    email?: string;
    bio?: string;
    paystring?: string;
    url?: string;
    did?: string;
    tel?: string;
};

export const EditProfile = () => {
    const { xumm, userInfo, avatar } = useUser();
    const { register, handleSubmit, watch, setValue } = useForm<UserProfile>({
        defaultValues: {
            avatar: avatar || userInfo.picture,
            name: "",
            email: "",
            bio: "",
            paystring: "",
            url: "",
            did: "",
            tel: "",
        }
    });

    const [isEditing, setIsEditing] = useState(false);
    // const [liked, setLiked] = useState(false);
    // const [favorited, setFavorited] = useState(false);
    const [scale, setScale] = useState(1);
    const editorRef = useRef<AvatarEditor | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            const userstoreGet = await xumm.userstore?.get("user");
            if (userstoreGet && userstoreGet.data && userstoreGet.data.user) {
                const user = userstoreGet.data.user;
                Object.keys(user).forEach(key => {
                    setValue(key as keyof UserProfile, user[key]);
                });
            }
        };
        fetchData();
    }, [xumm, setValue]);

    const onSubmit = async (data: UserProfile) => {
        await xumm.userstore?.set("user", data);
        setIsEditing(false)
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files![0];
        const reader = new FileReader();
        reader.onloadend = () => {
            setValue('avatar', reader.result as string);
        };
        if (file) {
            reader.readAsDataURL(file);
        }
    };

    const handleSaveAvatar = () => {
        if (editorRef.current) {
            const canvas = editorRef.current.getImage();
            const canvasDataURL = canvas.toDataURL();
            setValue('avatar', canvasDataURL);
            setScale(1);
        }
    };

    const copyToClickBoard = (content: string) => {
        navigator.clipboard.writeText(content)
            .then(() => {
                console.log("Text copied to clipboard...")
            })
            .catch(err => {
                console.log('Something went wrong', err);
            })
    }

    const formatUrlForDisplay = (url?: string) => {
        if (url) {
            return url.replace(/^https?:\/\//, '');
        }
    };

    return (
        <div className='card-body text-accent shadow-xl'>

            {/* プロフィール編集画面 */}
            {isEditing ? (
                <form onSubmit={handleSubmit(onSubmit)} className="p-3">

                    <h2 className="text-3xl">Edit</h2>
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">Name</span>
                        </label>
                        <input
                            className="input input-bordered"
                            type="text"
                            {...register('name')}
                        />
                    </div>
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">Email</span>
                        </label>
                        <input
                            className="input input-bordered"
                            type="email"
                            placeholder='bob@email.com'
                            {...register('email')} />
                    </div>
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">URL</span>
                        </label>
                        <input
                            className="input input-bordered"
                            type="url"
                            placeholder='http://example.com'
                            {...register('url')}
                        />
                    </div>
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">Tel</span>
                        </label>
                        <input
                            className="input input-bordered"
                            type="tel"
                            placeholder='+1 (123) 456-7890'
                            pattern="^\+?(\d[\d-. ]+)?(\([\d-. ]+\))?[\d-. ]+\d$"
                            {...register('tel')}
                        />
                    </div>
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">Bio</span>
                        </label>
                        <textarea
                            className="textarea textarea-bordered"
                            {...register('bio')}
                        />
                    </div>
                    <div className="form-control my-3 btn-group btn-group-vertical">
                        <button
                            className="btn btn-primary"
                        >
                            Save Changes
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsEditing(false)}
                            className="btn btn-ghost border-secondary"
                        >
                            Cancel
                        </button>
                    </div>

                </form>
            ) : (
                // ... プレビュー表示 ...
                <>
                    <h1 className='text-3xl'>Profile</h1>

                    {/* <div className='m-1 h-8'>
                        <label tabIndex={0} className="btn btn-ghost rounded-btn swap swap-flip btn-sm text-2xl">
                            <input type="checkbox" checked={liked} onChange={() => setLiked(!liked)} />
                            <div className="swap-on">👍<div className="badge">+1</div></div>
                            <div className="swap-off">👍</div>
                        </label>
                        <label tabIndex={0} className="btn btn-ghost rounded-btn swap swap-flip btn-sm text-2xl">
                            <input type="checkbox" checked={favorited} onChange={() => setFavorited(!favorited)} />
                            <div className="swap-on">❤️<div className="badge badge-secondary">+1</div></div>
                            <div className="swap-off">♡</div>
                        </label>
                    </div> */}

                    <div
                        onClick={() => { (window as any).my_modal_2.showModal(); handleSaveAvatar(); }}
                        className='avatar w-52 mx-auto my-3 p-3'>
                        <Imag
                            priority={false}
                            src={watch("avatar") || '/ipfs/avatar.png'}
                            alt="avatar"
                            width={300}
                            height={300}
                        />
                    </div>
                    <div className="flex items-center justify-center">
                        <div id="account" className="truncate">
                            {userInfo.account}
                        </div>
                        <button className="btn-xs hover:bg-accent w-26 cursor-copy" onClick={() => {
                            const content = document.getElementById('account')?.textContent;
                            if (content) { copyToClickBoard(content); }
                        }}>Copy
                        </button>
                    </div>

                    {userInfo && Object.entries(userInfo).map(([key, value]) => {
                        if (key === 'account' || key === 'picture') {
                            return null;
                        }
                        if (typeof value === 'object' && value !== null) {
                            return Object.entries(value).map(([subKey, subValue]) => {
                                if (subKey === 'account' || subKey === 'picture') {
                                    return null;
                                }
                                return <p key={subKey}>{subValue as string}</p>
                            });
                        } else {
                            return <p key={key}>{value}</p>;
                        }
                    })}

                    <br />
                    <p>{watch("name")}</p>
                    <a href={watch("url")} className="block underline">{formatUrlForDisplay(watch("url"))}</a>
                    <p>{watch("email")}</p>
                    <p>{watch("tel")}</p>
                    <p>{watch("did")}</p>
                    <p>{watch("bio")}</p>

                    <button
                        className="btn btn-primary my-3 mx-auto"
                        onClick={() => setIsEditing(true)}
                    >
                        Edit
                    </button>
                </>
            )}
            {/* アバター編集モーダル */}
            <dialog id="my_modal_2" className="modal">
                <form method="dialog" className="modal-box">
                    <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>

                    <h2 className="font-bold text-3xl">Edit Avatar</h2>

                    <AvatarEditor
                        ref={editorRef}
                        image={watch("avatar") || "/ipfs/avatar.png"}
                        key={watch("avatar")}
                        width={250}
                        height={250}
                        border={2}
                        color={[255, 255, 255, 0.6]}
                        scale={scale}
                        borderRadius={150}
                        className="my-3 mx-auto bg-neutral"
                        crossOrigin="anonymous"
                    />

                    <input
                        type="range"
                        value={scale}
                        min="0.5"
                        max="1.5"
                        step="0.01"
                        onChange={(e) => setScale(parseFloat(e.target.value))}
                        className="w-[80%] my-3"
                    />
                    <input
                        type="file"
                        onChange={handleImageUpload}
                        className="file-input file-input-ghost w-[90%] my-3"
                    />
                    <button
                        onClick={handleSaveAvatar}
                        className="btn btn-primary w-[90%]">
                        Save Avatar
                    </button>
                </form>
                <form method="dialog" className="modal-backdrop">
                    <button>Close</button>
                </form>
            </dialog>
        </div>

    )
}
