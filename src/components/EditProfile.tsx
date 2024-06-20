"use client"
import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import AvatarEditor from 'react-avatar-editor';
import { Imag } from "@/components/Imag"
import { UserProfile, useUser } from "@/components/UserProvider"
import { DID } from './DID';
import { hash } from '@/lib/hash';
import { useRouter } from 'next/navigation';
import { websocket } from '@/lib/websocket';

export const EditProfile = () => {
    const { xumm, user, gravatar, store, info, tx, obj } = useUser();

    const { register, handleSubmit, watch, setValue } = useForm<UserProfile>({
        defaultValues: {
            account: user.account,
            age: store?.age,
            avatar: store?.avatar || gravatar || user.picture,
            bio: store?.bio,
            country: store?.country,
            currency: store?.currency,
            did: store?.did,
            gender: store?.gender,
            email: store?.email,
            job: store?.job,
            lang: store?.lang,
            locate: store?.locate,
            name: store?.name,
            paystring: store?.paystring,
            tel: store?.tel,
            url: store?.url,
            uuid: store?.uuid,
            sns: store?.sns,
        }
    });
    const [isEditing, setIsEditing] = useState(false);
    // const [liked, setLiked] = useState(false);
    // const [favorited, setFavorited] = useState(false);
    const [scale, setScale] = useState(1);
    const editorRef = useRef<AvatarEditor | null>(null);
    const [rinfo, setInfo] = useState(info)
    const [rtx, setTx] = useState(tx)
    const [robj, setObj] = useState(obj)
    const router = useRouter()

    const onSubmit = async (data: UserProfile) => {
        Object.keys(data).forEach(key => {
            const typedKey = key as keyof UserProfile;
            if (data[typedKey] === '') {
                data[typedKey] = null;
            }
        });
        const put = await fetch(`/api/${data.account}`, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${process.env.TOKEN}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name: data?.name,
                age: data?.age,
                avatar: data?.avatar,
                bio: data?.bio,
                currency: data?.currency,
                country: data?.country,
                email: data?.email,
                gender: data?.gender,
                job: data?.job,
                lang: data?.lang,
                locate: data?.locate,
                url: data?.url,
                tel: data?.tel,
                sns: data?.sns,
            }),
        });

        const update = await put.json()
        const setData = update.result

        Object.keys(setData).forEach(key => {
            const typedKey = key as keyof UserProfile;
            if (setData[typedKey] === null) {
                setData[typedKey] = undefined;
            }
        });
        // console.log(setData)
        const id = await hash(user.account)
        await xumm.userstore?.set(id, setData);
        setIsEditing(false)
        const ws = await websocket(user.account!, user.networkEndpoint!)
        setInfo(ws!.info)
        setTx(ws!.tx)
        setObj(ws!.obj)
        router.refresh()
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

    const handleSaveAvatar = async () => {
        if (editorRef.current) {
            const canvas = editorRef.current.getImage();
            const canvasDataURL = canvas.toDataURL();

            // IPFSに画像をアップロード
            const blob = await (await fetch(canvasDataURL)).blob();
            const file = new File([blob], 'avatar.png', { type: 'image/png' });
            const data = new FormData();
            data.append("file", file);

            try {
                const res = await fetch("/api/pinata", {
                    method: "POST",
                    body: data,
                });

                const cid = await res.json();
                if (res.status === 200) {
                    setValue("avatar", `https://ipfs.io/ipfs/${cid}`);
                    await onSubmit(watch());
                } else {
                    throw new Error("Failed to upload to IPFS");
                }
                setScale(1)
            } catch (error) {
                console.error("Upload error:", error);
            }
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
        <div className='text-accent shadow-xl'>

            {/* プロフィール編集画面 */}
            {isEditing ? (
                <form onSubmit={handleSubmit(onSubmit)} className="p-2 px-8">

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
                            <span className="label-text">Locate</span>
                        </label>
                        <input
                            className="input input-bordered"
                            type="text"
                            placeholder='Asia/Tokyo'
                            {...register('locate')}
                        />
                    </div>
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">Lang</span>
                        </label>
                        <input
                            className="input input-bordered"
                            type="text"
                            placeholder='Japanese'
                            {...register('lang')}
                        />
                    </div>
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">Currency</span>
                        </label>
                        <input
                            className="input input-bordered"
                            type="text"
                            placeholder='JPY'
                            {...register('currency')}
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
                            <span className="label-text">SNS</span>
                        </label>
                        <input
                            className="input input-bordered"
                            type="text"
                            placeholder='x.com/name'
                            {...register('sns')}
                        />
                    </div>
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">Age</span>
                        </label>
                        <input
                            className="input input-bordered"
                            type="number"
                            {...register('age')}
                        />
                    </div>
                    <label className="label">
                        <span className="label-text">Gender</span>
                    </label>
                    <div className="input input-bordered flex justify-between">
                        <label className="label cursor-pointer">
                            <span className="label-text">female</span>
                            <input type="radio" value="female" id="female" className="radio checked:bg-red-500" checked={watch("gender") === 'female'} {...register('gender')} />
                        </label>
                        <label className="label cursor-pointer">
                            <span className="label-text">male</span>
                            <input type="radio" value="male" id="male" className="radio checked:bg-blue-500" checked={watch("gender") === 'male'} {...register('gender')} />
                        </label>
                        <label className="label cursor-pointer">
                            <span className="label-text">none</span>
                            <input type="radio" value="" id="none" className="radio checked:bg-gray-500" checked={watch("gender") === ""} {...register('gender')} />
                        </label>
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
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">Country</span>
                        </label>
                        <input
                            className="input input-bordered"
                            type="text"
                            placeholder='Japan'
                            {...register('country')}
                        />
                    </div>
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">Job</span>
                        </label>
                        <input
                            className="input input-bordered"
                            type="text"
                            placeholder='Engineer'
                            {...register('job')}
                        />
                    </div>
                    <div className="form-control my-3 btn-group btn-group-vertical">
                        <button
                            className="text-xl btn btn-primary"
                        >
                            Save Changes
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsEditing(false)}
                            className="text-xl btn btn-ghost border-secondary"
                        >
                            Cancel
                        </button>
                    </div>

                </form>
            ) : (
                // ... プレビュー表示 ...
                <>
                    <h1 className='mt-2 text-3xl'>Profile</h1>

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
                        onClick={() => { (window as any).my_modal_2.showModal(); }}
                        className='avatar w-64 mx-auto my-3 p-3'>
                        <Imag
                            priority={true}
                            src={watch("avatar") || '/ipfs/avatar.png'}
                            alt="avatar"
                            width={256}
                            height={256}
                        />
                    </div>
                    <div className='text-lg truncate'>
                        {(info.account_data?.Balance / 1000000) || ""} XRP
                    </div>
                    <div className="flex items-center justify-center">
                        <div id="account" className="truncate">
                            {user.account}
                        </div>
                        <button
                            className="btn-xs hover:bg-accent w-26 cursor-copy"
                            onClick={() => {
                                const content = document.getElementById('account')?.textContent;
                                if (content) { copyToClickBoard(content); }
                            }}>Copy
                        </button>
                    </div>
                    <div >
                        {user.networkEndpoint}
                    </div>

                    <dl className='text-left m-4 p-4 border-2 border-primary rounded-box overflow-scroll whitespace-nowrap'>
                        <dd>{watch("name") && "name: "}{watch("name")}</dd>
                        <dd className='block'>{watch("url") && "url: "}
                            <a href={watch("url")!} className="underline">{formatUrlForDisplay(watch("url")!)}</a>
                        </dd>
                        <dd>{watch("email") && "email: "}{watch("email")}</dd>
                        <dd>{watch("tel") && "tel: "}{watch("tel")}</dd>
                        <dd>{watch("sns") && "sns: "}{watch("sns")}</dd>
                        <dd>{watch("locate") && "locate: "}{watch("locate")}</dd>
                        <dd>{watch("country") && "country: "}{watch("country")}</dd>
                        <dd>{watch("lang") && "lang: "}{watch("lang")}</dd>
                        <dd>{watch("currency") && "currency: "}{watch("currency")}</dd>
                        <dd>{watch("age") && "age: "}{watch("age")}</dd>
                        <dd>{watch("gender") && "gender: "}{watch("gender")}</dd>
                        <dd>{watch("job") && "job: "}{watch("job")}</dd>
                        <dd>{watch("bio") && "bio: "}{watch("bio")}</dd>
                        <dd>{watch("did") && "did: "}{watch("did")}</dd>
                        {/* <dd>{watch("uuid") && "uuid: "}{watch("uuid")}</dd> */}
                    </dl>

                    <button
                        className="text-xl btn btn-primary mx-auto w-80"
                        onClick={() => setIsEditing(true)}
                    >
                        Edit Profile
                    </button>

                    <DID profile={watch()} />

                    <div className="stat">
                        <details className="collapse collapse-arrow border border-primary bg-base-100">
                            <summary className="collapse-title text-2xl">
                                Account Info
                            </summary>
                            <div className="collapse-content text-left">
                                <pre className="text-success text-xs overflow-scroll">
                                    result: {JSON.stringify(rinfo, null, 2)}
                                </pre>
                            </div>
                        </details>
                    </div>
                    <div className='stat'>
                        <details className="collapse collapse-arrow border border-primary bg-base-100">
                            <summary className="collapse-title text-2xl">
                                DID Tx
                            </summary>
                            <div className="collapse-content text-left">
                                <pre className="text-success text-xs overflow-scroll">
                                    {JSON.stringify(rtx, null, 2)}
                                </pre>
                            </div>
                        </details>
                    </div>
                    <div className="stat">
                        <details className="collapse collapse-arrow border border-primary bg-base-100">
                            <summary className="collapse-title text-2xl">
                                DID Object
                            </summary>
                            <div className="collapse-content text-left">
                                <pre className="text-success text-xs overflow-scroll">
                                    {JSON.stringify(robj, null, 2)}
                                </pre>
                            </div>
                        </details>
                    </div>
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
                        max="2"
                        step="0.02"
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
