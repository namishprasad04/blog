import { memo, useEffect, useState } from "react";
import { faker } from "@faker-js/faker";
import { PostProvider, usePosts } from "./PostContext";

function createRandomPost() {
  return {
    title: `${faker.hacker.adjective()} ${faker.hacker.noun()}`,
    body: faker.hacker.phrase(),
  };
}

function App() {
  const [isFakeDark, setIsFakeDark] = useState(false);
  // Whenever `isFakeDark` changes, we toggle the `fake-dark-mode` class on the HTML element (see in "Elements" dev tool).
  useEffect(
    function () {
      document.documentElement.classList.toggle("fake-dark-mode");
    },
    [isFakeDark]
  );

  return (
    <section>
      <button
        onClick={() => setIsFakeDark((isFakeDark) => !isFakeDark)}
        className="btn-fake-dark-mode fixed bottom-5 right-4 z-10 p-4 md:p-3"
      >
        {isFakeDark ? "☀️" : "🌙"}
      </button>

      <PostProvider>
        <Header />
        <Main />
        <Archive />
        <Footer />
      </PostProvider>
    </section>
  );
}

function Header() {
  const { onClearPosts } = usePosts();
  return (
    <header>
      <h1 className="text-md md:text-3xl">Quick Blog</h1>
      <div className="">
        <Results />
        <SearchPosts />
        <button className="hidden md:flex" onClick={onClearPosts}>
          Clear posts
        </button>
      </div>
    </header>
  );
}

function SearchPosts() {
  const { searchQuery, setSearchQuery } = usePosts();
  return (
    <input
      className="w-[8rem] md:w-[12rem] text-sm md:text-md py-2 px-3"
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      placeholder="Search posts..."
    />
  );
}

function Results() {
  const { posts } = usePosts();
  return <p className="text-sm">🚀 {posts.length} posts found</p>;
}

const Main = memo(function Main() {
  return (
    <main>
      <FormAddPost />
      <Posts />
    </main>
  );
});

function Posts() {
  return (
    <section>
      <List />
    </section>
  );
}

function FormAddPost() {
  const { onAddPost } = usePosts();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const handleSubmit = function (e) {
    e.preventDefault();
    if (!body || !title) return;
    onAddPost({ title, body });
    setTitle("");
    setBody("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col md:flex-row">
      <input
      className="p-3"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Post title"
      />
      <textarea
      className="p-2"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Post body"
      />
      <button>Add post</button>
    </form>
  );
}

function List() {
  const { posts, onDeletePost, onEditPost } = usePosts();
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editBody, setEditBody] = useState("");

  const handleEdit = (post) => {
    setEditingId(post.id);
    setEditTitle(post.title);
    setEditBody(post.body);
  };

  const handleSave = () => {
    onEditPost(editingId, { title: editTitle, body: editBody });
    setEditingId(null);
  };

  const handleCancel = () => {
    setEditingId(null);
  };

  return (
    <>
      <ul className="grid md:grid-cols-3 lg:grid-cols-4">
        {posts.map((post) => (
          <div key={post.id} className="border border-[#ffe8cc] relative h-[170px] md:h-[200px] hover:bg-[#fff4e6] ">
            <li className="p-5">
              {editingId === post.id ? (
                <>
                  <input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full mb-2 p-1"
                  />
                  <textarea
                    value={editBody}
                    onChange={(e) => setEditBody(e.target.value)}
                    className="w-full mb-2 p-1"
                  />
                  <div className="flex gap-2">
                    <button onClick={handleSave}>Save</button>
                    <button onClick={handleCancel}>Cancel</button>
                  </div>
                </>
              ) : (
                <>
                  <h3>{post.title}</h3>
                  <p>{post.body}</p>
                  <div className="flex gap-5 absolute bottom-4 left-5 md:left-8">
                    <button onClick={() => handleEdit(post)}>Edit</button>
                    <button onClick={() => onDeletePost(post.id)}>Delete</button>
                  </div>
                </>
              )}
            </li>
          </div>
        ))}
      </ul>
    </>
  );
}

function Archive() {
  const { onAddPost } = usePosts();
  // Here we don't need the setter function. We're only using state to store these posts because the callback function passed into useState (which generates the posts) is only called once, on the initial render. So we use this trick as an optimization technique, because if we just used a regular variable, these posts would be re-created on every render. We could also move the posts outside the components, but I wanted to show you this trick 😉
  const [posts] = useState(() =>
    // 💥 WARNING: This might make your computer slow! Try a smaller `length` first
    Array.from({ length: 10 }, () => createRandomPost())
  );

  const [showArchive, setShowArchive] = useState(false);

  return (
    <aside>
      <h2>Post archive</h2>
      <button onClick={() => setShowArchive((s) => !s)}>
        {showArchive ? "Hide archive posts" : "Show archive posts"}
      </button>

      {showArchive && (
        <ul className="flex flex-col">
          {posts.map((post, i) => (
            <li key={i} className="flex flex-col md:flex-row md:justify-between md:items-center p-5 md:p-2">
              <p className="mb-5 md:mb-0">
                <strong>{post.title}:</strong> {post.body}
              </p>
              <button className="w-[140px]" onClick={() => onAddPost(post)}>Add as new post</button>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}

function Footer() {
  return <footer>&copy; by The Atomic Blog ✌️</footer>;
}

export default App;
