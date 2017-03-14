import React from 'react'
import { IndexLink, Link } from 'react-router'
import './Header.scss'

export const Header = () => (
  <div>
    <h1>Entrepreneur Survey</h1>
    <IndexLink to='/' activeClassName='route--active'>
      Home
    </IndexLink>
    {' · '}
    <Link to='/counter' activeClassName='route--active'>
      Counter
    </Link>
    {' · '}
    <Link to='/zen' activeClassName='route--active'>
      Zen
    </Link>
    {' · '}
    <Link to='/survey' activeClassName='route--active'>
      Survey
    </Link>
   </div>
)

export default Header
