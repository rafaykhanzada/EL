import React, { FC, useEffect, useState } from 'react';
import Icon from '../../Components/icon/Icon';
import axios from 'axios';
import { toast } from 'react-toastify';
import { decryptString } from '../../app.utils';

interface ITopPanel {
    doc: {
        highlighter: Boolean,
        bookmark: Boolean,
        type: string,
        id: string,
        header: string,
        detail: string,
    },
    setDoc: Function
}

type TBookmark = {
    id: string,
    typeName?: string,
    targetId?: string,
    userId?: string,
    header?: string,
    detail?: string,
    createdOn?: string,
    createdBy?: string
};

const TopPanel: FC<ITopPanel> = ({ doc,
    setDoc }) => {

    const [isBookmarkFetched, setBookmarkFetched] = useState(false);
    const [bookmark, setBookmark] = useState<TBookmark>({ id: '' });
    const updateBookmark = (doc: any) => {
        console.log(doc);
        const bookmarkPayload = { type: doc.type, id: doc.id, header: doc.header || 'Bookmark title', detail: doc.detail };
        if (doc.bookmark) {
            deleteBookmark(bookmarkPayload, bookmark.id);
        } else {
            createBookmark(bookmarkPayload);
        }
    }

    const createBookmark = async (data: any) => {
        const URL = `${process.env.REACT_APP_API_NEST_URL}/bookmark`;
        const payload = {
            targetId: data.id,
            typeName: data.type,
            userId: decryptString(localStorage.getItem('userId')),
            header: data.header,
            detail: data.detail,
            createdBy: decryptString(localStorage.getItem('username')),
        };
        const response = await axios.post(URL, payload, {
            headers: {
              Authorization: `Bearer ${decryptString(localStorage.getItem('token'))}`
            },
          }).catch(err => {
            console.log('Failed to create bookmark');
            toast.error('Failed to create bookmark.');
        })
        if (response) {
            toast.success('Bookmark created successfully.');
            setBookmark(response.data);
            setDoc({ ...doc, bookmark: true })
        }
        console.log(response)

    }

    const deleteBookmark = async (data: any, id: string) => {
        const userId = decryptString(localStorage.getItem('userId'));
        const bookmarkId = id;
        console.log('Bookmark deleted successfully');
        const URL = `${process.env.REACT_APP_API_NEST_URL}/bookmark?userId=${userId}&bookmarkIds=${bookmarkId}`;
        const response = await axios.delete(URL, {
            headers: {
              Authorization: `Bearer ${decryptString(localStorage.getItem('token'))}`
            },
          }).catch(err => {
            console.log('Failed to delete bookmark');
            toast.error('Failed to delete bookmark.');
        });
        if (response) {
            toast.success('Bookmark removed successfully.');
            setBookmark({id: ''});
            setDoc({ ...data, bookmark: false });
        }
        console.log(response)
    };

    useEffect(() => {
        setTimeout(() => {
            if (!isBookmarkFetched) {
                const targetId = doc.id;
                const type = doc.type;
                const userId = decryptString(localStorage.getItem('userId'));
                const URL = `${process.env.REACT_APP_API_NEST_URL}/bookmark?targetId=${targetId}&typeName=${type}&userId=${userId}`;
                if (targetId && type) {
                    const response = axios.get(URL, {
                        headers: {
                          Authorization: `Bearer ${decryptString(localStorage.getItem('token'))}`
                        },
                      }).catch(err => {
                        console.log('Failed to get bookmark');
                    }).then(response => {
                        if (response) {
                            setBookmarkFetched(true);
                            setBookmark(response.data.data[0]);
                            if (response.data.data[0]) {
                                setDoc({ ...doc, bookmark: true });
                            }
                            console.log(doc);
                        }
                    })
                }
            }
        }, 500);
    }, [doc])

    return (
        <div className="flex flex-col h-full">
            <div className="flex flex-row justify-end items-center">
                <div
                    className='navigation-item cursor-pointer'
                    onClick={() => {
                        updateBookmark({ ...doc, bookmark: doc.bookmark });
                    }}
                    data-tour='documentation'>
                    <span className='navigation-link navigation-link-pill'>
                        <span className='navigation-link-info'>
                            <Icon
                                icon={doc.bookmark ? 'Bookmark' : 'BookmarkBorder'}
                                color={doc.bookmark ? 'danger' : undefined}
                                className='navigation-icon'
                            />
                            <span className='navigation-text text-lg text-black'>
                                Bookmark
                            </span>
                        </span>
                    </span>
                </div>
            </div>
        </div>
    )
}

export default TopPanel