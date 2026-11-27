import React, { useState, useEffect } from 'react'
import sampleProducts from '../data/sample'
import ProductTable from '../components/ProductTable'
import api from '../api/axiosClient'

export default function AdminDashboard() {
    // const [products] = useState(sampleProducts)
    const [products, setProducts] = useState([])
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(true)
    
    const loadProduct = async()=>{
        setLoading(true)
        setError('')
        try{
            const {data, total} = await api.get('/products', {params: {page: 1, limit: 10}})
            setProducts(data.data)
        }catch(err){
            setError(err.response?.data?.message)
        }finally{
            setLoading(false)
        }
    }
    useEffect(() => {
        loadProduct()
    }, [])
    
    return (
        <main>
            <div>
                <h1>Sản phẩm</h1>
                <button data-testid="add-button" className='add-button'>Thêm sản phẩm</button>
            </div>
            
            {loading && <p data-testid="loading">loading</p>}

            {!loading && error && (
                <div data-testid="error-message" className='error-message'>
                    <p>{error}</p>
                    <button data-testid="retry-button" className='retry-button' onClick={loadProduct}>Thử lại</button>
                </div>
            )}
            
            {!loading && !error && products.length === 0 && (
                <div data-testid="empty-state" className='empty-state'>
                    <p>Không có sản phẩm nào</p>
                </div>
                )
            }

            {!loading && !error && products.length > 0 &&
                <ProductTable products={products}></ProductTable>      
            }
        </main>
    )
}
