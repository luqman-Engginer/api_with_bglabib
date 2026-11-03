
import { useCallback, useEffect, useMemo, useState } from 'react'
import './App.css'

const API_URL = 'http://127.0.0.1:8000/api/books'

const EMPTY_FORM = {
  title: '',
  author: '',
  category: '',
  stock: 1,
}

function getBooksFromResponse(result) {
  if (Array.isArray(result)) return result
  if (Array.isArray(result.data)) return result.data
  if (Array.isArray(result.data?.data)) return result.data.data
  if (Array.isArray(result.books)) return result.books
  return []
}

function getErrorMessage(error) {
  return error.message || 'Terjadi kesalahan. Silakan coba lagi.'
}

function normalizeBook(book) {
  return {
    ...book,
    title: book.title ?? book.name ?? '',
    author: book.author ?? book.writer ?? '',
    category: book.category ?? book.category_name ?? '',
    stock: book.stock ?? book.quantity ?? 0,
  }
}

export default function App() {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingBook, setEditingBook] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [deletingId, setDeletingId] = useState(null)

  const request = useCallback(async (url, options = {}) => {
    const response = await fetch(url, {
      ...options,
      headers: {
        Accept: 'application/json',
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...options.headers,
      },
    })

    const text = await response.text()
    let result = {}

    try {
      result = text ? JSON.parse(text) : {}
    } catch {
      result = { message: text }
    }

    if (!response.ok) {
      const validationErrors = result.errors
        ? Object.values(result.errors).flat().join(' ')
        : ''

      throw new Error(
        validationErrors ||
        result.message ||
        `Request gagal dengan status ${response.status}`
      )
    }

    return result
  }, [])

  const loadBooks = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true)
    setError('')

    try {
      const result = await request(API_URL)
      setBooks(getBooksFromResponse(result).map(normalizeBook))
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [request])

  useEffect(() => {
    loadBooks()
  }, [loadBooks])

  const filteredBooks = useMemo(() => {
    const keyword = search.trim().toLowerCase()

    if (!keyword) return books

    return books.filter((book) =>
      [
        book.title,
        book.author,
        book.category,
        book.id,
      ].some((value) =>
        String(value ?? '').toLowerCase().includes(keyword)
      )
    )
  }, [books, search])

  function openCreateModal() {
    setEditingBook(null)
    setForm({ ...EMPTY_FORM })
    setNotice('')
    setModalOpen(true)
  }

  function openEditModal(book) {
    setEditingBook(book)
    setForm({
      title: book.title,
      author: book.author,
      category: book.category,
      stock: book.stock,
    })
    setNotice('')
    setModalOpen(true)
  }

  function closeModal() {
    if (saving) return
    setModalOpen(false)
    setEditingBook(null)
    setForm({ ...EMPTY_FORM })
  }

  function handleFormChange(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSaving(true)
    setError('')
    setNotice('')

    const payload = {
      title: form.title.trim(),
      author: form.author.trim(),
      category: form.category.trim(),
      stock: Number(form.stock),
    }

    try {
      if (editingBook) {
        await request(`${API_URL}/${editingBook.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        })
        setNotice('Data buku berhasil diperbarui.')
      } else {
        await request(API_URL, {
          method: 'POST',
          body: JSON.stringify(payload),
        })
        setNotice('Buku berhasil ditambahkan.')
      }

      setModalOpen(false)
      setEditingBook(null)
      setForm({ ...EMPTY_FORM })
      await loadBooks(false)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(book) {
    const confirmed = window.confirm(
      `Yakin ingin menghapus buku "${book.title}"?`
    )

    if (!confirmed) return

    setDeletingId(book.id)
    setError('')
    setNotice('')

    try {
      await request(`${API_URL}/${book.id}`, {
        method: 'DELETE',
      })

      setBooks((current) =>
        current.filter((item) => item.id !== book.id)
      )
      setNotice(`Buku "${book.title}" berhasil dihapus.`)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setDeletingId(null)
    }
  }

  const totalStock = books.reduce(
    (total, book) => total + (Number(book.stock) || 0),
    0
  )

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a href="#dashboard" className="brand">
          <span className="brand-icon">B</span>
          <span>
            <strong>BookSpace</strong>
            <small>LIBRARY MANAGEMENT</small>
          </span>
        </a>

        <p className="menu-label">MENU UTAMA</p>
        <a className="nav-link active" href="#dashboard">
          <span>▦</span> Dashboard
        </a>
        <a className="nav-link" href="#books">
          <span>▤</span> Koleksi Buku
        </a>

        <div className="sidebar-bottom">
          <div className="sidebar-note">
            <span className="note-icon">✦</span>
            <strong>Ruang untuk membaca.</strong>
            <p>Kelola koleksi buku dengan lebih mudah.</p>
          </div>
          <small className="sidebar-footer">BOOKSPACE © 2026</small>
        </div>
      </aside>

      <main className="main-content" id="dashboard">
        <header className="topbar">
          <div>
            <p className="eyebrow">LIBRARY / OVERVIEW</p>
            <h1>Dashboard Perpustakaan</h1>
            <p className="page-subtitle">
              Kelola koleksi buku perpustakaanmu di satu tempat.
            </p>
          </div>

          <div className="profile">
            <div className="profile-avatar">A</div>
            <div>
              <strong>Administrator</strong>
              <small>Pengelola Perpustakaan</small>
            </div>
          </div>
        </header>

        {notice && (
          <div className="alert success-alert" role="status">
            <span>✓</span>
            <p>{notice}</p>
            <button onClick={() => setNotice('')} aria-label="Tutup notifikasi">
              ×
            </button>
          </div>
        )}

        {error && (
          <div className="alert error-alert" role="alert">
            <span>!</span>
            <p>{error}</p>
            <button onClick={() => setError('')} aria-label="Tutup pesan error">
              ×
            </button>
          </div>
        )}

        <section className="welcome-banner">
          <div className="welcome-copy">
            <span className="banner-tag">YOUR LIBRARY, ORGANIZED</span>
            <h2>Semua buku, lebih teratur.</h2>
            <p>
              Pantau koleksi, tambah buku baru, dan perbarui data
              perpustakaan dengan praktis.
            </p>
            <button className="banner-button" onClick={openCreateModal}>
              + Tambah Buku Baru
            </button>
          </div>
          <div className="book-illustration" aria-hidden="true">
            <span className="book book-one" />
            <span className="book book-two" />
            <span className="book book-three" />
            <span className="plant">✳</span>
          </div>
        </section>

        <section className="stats-grid" aria-label="Statistik perpustakaan">
          <article className="stat-card">
            <div className="stat-top">
              <span>Total Judul Buku</span>
              <span className="stat-icon purple">▤</span>
            </div>
            <strong>{books.length}</strong>
            <small>Judul dalam koleksi</small>
          </article>

          <article className="stat-card">
            <div className="stat-top">
              <span>Total Stok</span>
              <span className="stat-icon orange">▣</span>
            </div>
            <strong>{totalStock}</strong>
            <small>Jumlah seluruh stok</small>
          </article>

          <article className="stat-card">
            <div className="stat-top">
              <span>Kategori</span>
              <span className="stat-icon green">▦</span>
            </div>
            <strong>
              {new Set(
                books.map((book) => book.category).filter(Boolean)
              ).size}
            </strong>
            <small>Kategori berbeda</small>
          </article>

          <article className="stat-card">
            <div className="stat-top">
              <span>Hasil Pencarian</span>
              <span className="stat-icon blue">⌕</span>
            </div>
            <strong>{filteredBooks.length}</strong>
            <small>Buku yang ditampilkan</small>
          </article>
        </section>

        <section className="books-section" id="books">
          <div className="section-heading">
            <div>
              <p className="eyebrow">BOOK COLLECTION</p>
              <h2>Koleksi Buku</h2>
              <p className="section-description">
                Daftar buku yang tersimpan di database.
              </p>
            </div>

            <button
              className="secondary-button"
              onClick={() => loadBooks()}
              disabled={loading}
            >
              <span className={loading ? 'refresh spinning' : 'refresh'}>↻</span>
              {loading ? 'Memuat...' : 'Refresh Data'}
            </button>
          </div>

          <div className="table-toolbar">
            <div className="search-box">
              <span>⌕</span>
              <input
                type="search"
                placeholder="Cari judul, penulis, kategori..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
              {search && (
                <button onClick={() => setSearch('')} aria-label="Hapus pencarian">
                  ×
                </button>
              )}
            </div>

            <span className="result-count">
              {filteredBooks.length} buku ditemukan
            </span>

            <button className="primary-button" onClick={openCreateModal}>
              + Tambah Buku
            </button>
          </div>

          <div className="table-wrap">
            <table className="books-table">
              <thead>
                <tr>
                  <th>BUKU</th>
                  <th>PENULIS</th>
                  <th>KATEGORI</th>
                  <th>STOK</th>
                  <th className="action-column">AKSI</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" className="empty-state">
                      <span className="loading-spinner" />
                      <strong>Memuat data buku...</strong>
                      <p>Sedang mengambil data dari Laravel API.</p>
                    </td>
                  </tr>
                ) : filteredBooks.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="empty-state">
                      <span className="empty-icon">▤</span>
                      <strong>
                        {error ? 'Data belum dapat ditampilkan' : 'Buku tidak ditemukan'}
                      </strong>
                      <p>
                        {error
                          ? 'Pastikan server Laravel aktif dan endpoint API benar.'
                          : search
                            ? 'Coba kata kunci pencarian yang lain.'
                            : 'Tambahkan buku pertama ke koleksi perpustakaan.'}
                      </p>
                      {!search && !error && (
                        <button className="primary-button" onClick={openCreateModal}>
                          + Tambah Buku
                        </button>
                      )}
                    </td>
                  </tr>
                ) : (
                  filteredBooks.map((book, index) => (
                    <tr key={book.id ?? `${book.title}-${index}`}>
                      <td>
                        <div className="book-cell">
                          <div className={`book-cover cover-${index % 5}`}>
                            {String(book.title || 'B').charAt(0).toUpperCase()}
                          </div>
                          <div className="book-info">
                            <strong>{book.title || 'Tanpa judul'}</strong>
                            <small>ID: {book.id ?? '—'}</small>
                          </div>
                        </div>
                      </td>
                      <td>{book.author || '—'}</td>
                      <td>
                        <span className="category-pill">
                          {book.category || 'Umum'}
                        </span>
                      </td>
                      <td>
                        <span className={`stock-badge ${Number(book.stock) > 0 ? 'in-stock' : 'out-stock'}`}>
                          {book.stock} unit
                        </span>
                      </td>
                      <td>
                        <div className="row-actions">
                          <button
                            className="icon-button edit-button"
                            onClick={() => openEditModal(book)}
                            title="Edit buku"
                            aria-label={`Edit ${book.title}`}
                          >
                            ✎
                          </button>
                          <button
                            className="icon-button delete-button"
                            onClick={() => handleDelete(book)}
                            disabled={deletingId === book.id}
                            title="Hapus buku"
                            aria-label={`Hapus ${book.title}`}
                          >
                            {deletingId === book.id ? '…' : '⌫'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="table-footer">
            <span>Menampilkan {filteredBooks.length} dari {books.length} buku</span>
            <span>Data berasal dari Laravel API</span>
          </div>
        </section>

        <footer className="page-footer">
          <span>BookSpace Library Dashboard</span>
          <span>Built with React & Laravel</span>
        </footer>
      </main>

      {modalOpen && (
        <div className="modal-overlay" onMouseDown={(event) => {
          if (event.target === event.currentTarget) closeModal()
        }}>
          <section
            className="book-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <div className="modal-header">
              <div>
                <p className="eyebrow">BOOK MANAGEMENT</p>
                <h2 id="modal-title">
                  {editingBook ? 'Edit Data Buku' : 'Tambah Buku Baru'}
                </h2>
                <p>Lengkapi informasi buku di bawah ini.</p>
              </div>
              <button className="modal-close" onClick={closeModal} disabled={saving}>
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <label>
                Judul Buku <span>*</span>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleFormChange}
                  placeholder="Masukkan judul buku"
                  required
                  maxLength={255}
                />
              </label>

              <label>
                Nama Penulis <span>*</span>
                <input
                  name="author"
                  value={form.author}
                  onChange={handleFormChange}
                  placeholder="Masukkan nama penulis"
                  required
                  maxLength={255}
                />
              </label>

              <label>
                Kategori
                <input
                  name="category"
                  value={form.category}
                  onChange={handleFormChange}
                  placeholder="Contoh: Teknologi, Novel, Sejarah"
                  maxLength={255}
                />
              </label>

              <label>
                Jumlah Stok <span>*</span>
                <input
                  type="number"
                  name="stock"
                  value={form.stock}
                  onChange={handleFormChange}
                  min="0"
                  required
                />
              </label>

              {error && <p className="modal-error">{error}</p>}

              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Batal
                </button>
                <button type="submit" className="primary-button" disabled={saving}>
                  {saving
                    ? 'Menyimpan...'
                    : editingBook
                      ? 'Simpan Perubahan'
                      : 'Simpan Buku'}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  )
}
