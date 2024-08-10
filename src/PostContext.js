import { faker } from "@faker-js/faker";
import { createContext, useContext, useMemo, useState } from "react";

function createRandomPost() {
  return {
    id: faker.string.uuid(),
    title: `${faker.hacker.adjective()} ${faker.hacker.noun()}`,
    body: faker.hacker.phrase(),
  };
}

// 1) create Context Provider
const PostContext = createContext();

function PostProvider({ children }) {
  const [posts, setPosts] = useState(() =>
    Array.from({ length: 30 }, () => createRandomPost())
  );
  const [searchQuery, setSearchQuery] = useState("");
  
  // Derived state. These are the posts that will actually be displayed
  const searchedPosts =
    searchQuery.length > 0
      ? posts.filter((post) =>
          `${post.title} ${post.body}`
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
        )
      : posts;

  function handleAddPost(post) {
    setPosts((posts) => [{ ...post, id: faker.datatype.uuid() }, ...posts]);
  }

  function handleClearPosts() {
    setPosts([]);
  }

  function handleDeletePost(id) {
    setPosts((posts) => posts.filter((post) => post.id !== id));
  }

  function handleEditPost(id, updatedPost) {
    setPosts((posts) =>
      posts.map((post) =>
        post.id === id ? { ...post, ...updatedPost } : post
      )
    );
  }

  const value = useMemo(() => {
    return {
      posts: searchedPosts,
      onAddPost: handleAddPost,
      onClearPosts: handleClearPosts,
      onDeletePost: handleDeletePost,
      onEditPost: handleEditPost,
      searchQuery,
      setSearchQuery,
    };
  }, [searchQuery, searchedPosts]);

  return (
    <PostContext.Provider value={value}>
      {children}
    </PostContext.Provider>
  );
}

function usePosts() {
  const context = useContext(PostContext);
  if (context === undefined)
    throw new Error("PostContext was used outside of the PostProvider");

  return context;
}

export { PostProvider, usePosts };