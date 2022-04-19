import React, { useMemo, useState, useRef, createElement } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import axios from 'axios';
import hljs from 'highlight.js';
import 'react-quill/dist/quill.core.css';
import 'react-quill/dist/quill.bubble.css';
import 'highlight.js/styles/vs2015.css';
import './App.css';

const App = (props) => {
  // 에디터 내용 변화에 따른 setText()!
  const [text, setText] = useState('');
  // const [deleteImg, setDeleteImg] = useState('');
  // 실시간 에디터 변화 감지를 위한 에디터 ref 설정
  const quillRef = useRef();

  // 실시간 에디터 내용 나옴
  console.log(text);

  // 향후 비디오 파일 서버에 저장후 url만 가지고 올수 있도록 custom 예정
  const videoHandler = () => {
    console.log('video handler on!!');
    const getVideoUrl = (url) => {
      return url;
    };

    const editor = quillRef.current.getEditor();
    let url = prompt('Enter Video URL: ');
    url = getVideoUrl(url);
    // let range = editor.getSelection();
    if (url != null) {
      console.log(url);
      editor.root.innerHTML =
        editor.root.innerHTML + `<p><iframe src=${url} crossOrigin /></p>`;
    }
  };

  // 이미지 서버에 저장후 url만 가지고 올수 있도록 custom!
  const imageHandler = (e) => {
    console.log('에디터에서 이미지 버튼을 클릭하면 이 핸들러가 시작됩니다!');

    // 1. 이미지를 저장할 input type=file DOM을 만든다.
    const input = document.createElement('input');

    // 속성 써주기
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click(); // 에디터 이미지버튼을 클릭하면 이 input이 클릭된다.
    // input이 클릭되면 파일 선택창이 나타난다.
    console.log(input);

    input.addEventListener('change', async () => {
      console.log('File OnChange!');
      const file = input.files[0];
      console.log(file);

      // multer에 맞는 형식으로 데이터 만들어준다.
      const formData = new FormData();
      const filename = `${Date.now()}${file.name}`;
      formData.append('name', filename);
      formData.append('file', file); // formData는 키-밸류 구조
      // 백엔드 multer라우터에 이미지를 보낸다.
      try {
        const result = await axios.post(
          'http://localhost:8080/img/upload',
          formData
        );
        console.log('성공 시, 백엔드가 보내주는 데이터', result.data);
        const IMG_URL = result.data;
        // 이 URL을 img 태그의 src에 넣은 요소를 현재 에디터의 커서에 넣어주면 에디터 내에서 이미지가 나타난다
        // src가 base64가 아닌 짧은 URL이기 때문에 데이터베이스에 에디터의 전체 글 내용을 저장할 수있게된다
        // 이미지는 꼭 로컬 백엔드 uploads 폴더가 아닌 다른 곳에 저장해 URL로 사용하면된다.

        // 이미지 태그를 에디터에 써주기 - 여러 방법이 있다.
        const editor = quillRef.current.getEditor(); // 에디터 객체 가져오기
        // 1. 에디터 root의 innerHTML을 수정해주기
        // editor의 root는 에디터 컨텐츠들이 담겨있다. 거기에 img태그를 추가해준다.
        // 이미지를 업로드하면 -> 멀터에서 이미지 경로 URL을 받아와 -> 이미지 요소로 만들어 에디터 안에 넣어준다.
        // editor.root.innerHTML =
        //   editor.root.innerHTML + `<img src=${IMG_URL} /><br/>`; // 현재 있는 내용들 뒤에 써줘야한다.

        // 2. 현재 에디터 커서 위치값을 가져온다
        const range = editor.getSelection();
        // 가져온 위치에 이미지를 삽입한다
        editor.insertEmbed(range.index, 'image', IMG_URL);
        // 향후 교차출처 에러시 사용 메소드
        // document
        //   .querySelectorAll('img')
        //   .forEach((img) => img.setAttribute('crossOrigin', 'anonymous'));
      } catch (error) {
        console.log('실패!!!');
      }
    });
  };

  hljs.configure({
    languages: ['javascript', 'html', 'css', 'react', 'sass', 'typescript'],
  });

  // Quill editor full toolbar 완성
  const modules = useMemo(() => {
    return {
      syntax: {
        highlight: (text) => hljs.highlightAuto(text).value,
      },
      toolbar: {
        container: [
          [{ header: [1, 2, 3, false] }],
          ['bold', 'italic', 'underline', 'strike', 'blockquote'],
          ['image', 'video', 'link', 'code-block', 'blockquote'],
          [
            {
              size: ['small', false, 'large', 'huge'],
            },
          ],
          [{ list: 'ordered' }, { list: 'bullet' }],
          [{ script: 'sub' }, { script: 'super' }],
          [{ indent: '-1' }, { indent: '+1' }],
          [{ direction: 'rtl' }],
          [{ color: [] }, { background: [] }],
          [
            {
              font: [],
            },
          ],
          [{ align: [] }],
          ['clean'],
        ],
        handlers: {
          // 이미지 처리는 우리가 직접 imageHandler라는 함수로 처리할 것이다.
          image: imageHandler,
          video: videoHandler,
        },
      },
    };
  }, []);

  // Quill editor full formats 완성
  const formats = [
    'header',
    'font',
    'size',
    'bold',
    'italic',
    'underline',
    'align',
    'strike',
    'script',
    'blockquote',
    'background',
    'list',
    'bullet',
    'indent',
    'link',
    'image',
    'color',
    'code-block',
  ];

  const inputText = (e) => {
    e.preventDefault();
  };
  // 서버에 저장 버튼

  const editorText = text;
  // innnerHTML을 통해서 웹사이트 적용

  // 에디터 내의 이미지 지우기 (서버사이드) 고민 중
  // const detectRemoveImg = async (e) => {
  //   console.log(text.lastIndexOf('img'));
  //   console.log(e.code);
  //   if (text.lastIndexOf('img') !== -1) {
  //     let firstSplit = text.split('src="')[1];
  //     let secondSplit = firstSplit.split('"></p>')[0];
  //     let fileName = secondSplit.split('images/')[1];

  //     if (e.code === 'Backspace' && text.lastIndexOf('img') === -1) {
  //       firstSplit && setDeleteImg(fileName.split('">')[0]);
  //       console.log(deleteImg);
  //       const res = await fetch(
  //         `http://localhost:8080/img/remove/${deleteImg}`,
  //         {
  //           method: 'DELETE',
  //           headers: {
  //             'Content-Type': 'application/json',
  //           },
  //         }
  //       );
  //       const result = await res.json();
  //       console.log(result);
  //     }
  //   }
  // };

  return (
    <>
      <form onSubmit={inputText}>
        <ReactQuill
          ref={quillRef}
          modules={modules}
          formats={formats}
          value={text}
          onChange={setText}
          // onKeyDown={detectRemoveImg}
          theme={'snow'}
        />
        <button type='submit'>Input</button>
      </form>
      <div className='ql-snow'>
        <div
          className='ql-editor'
          dangerouslySetInnerHTML={{ __html: editorText }}
          style={{ width: '98vw', height: 'fitContent' }}
        ></div>
      </div>
    </>
  );
};

export default App;
